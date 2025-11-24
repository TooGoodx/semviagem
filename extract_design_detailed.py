#!/usr/bin/env python3
"""
Script de Extração Completa de Design - Projeto Sem Viagem
Extrai todas as informações visuais, CSS, cores, tipografia e componentes
"""

import json
from playwright.sync_api import sync_playwright
import time

def extract_computed_styles(page, selector, properties):
    """Extrai propriedades CSS computadas de um elemento"""
    try:
        element = page.locator(selector).first
        if not element.is_visible():
            return None

        styles = {}
        for prop in properties:
            value = element.evaluate(f"""
                el => window.getComputedStyle(el).getPropertyValue('{prop}')
            """)
            styles[prop] = value.strip() if value else None

        return styles
    except Exception as e:
        return None

def rgb_to_hex(rgb_string):
    """Converte RGB para HEX"""
    if not rgb_string or rgb_string == 'transparent' or 'rgba(0, 0, 0, 0)' in rgb_string:
        return 'transparent'

    try:
        # Extrai números do rgb(r, g, b) ou rgba(r, g, b, a)
        import re
        numbers = re.findall(r'\d+', rgb_string)
        if len(numbers) >= 3:
            r, g, b = int(numbers[0]), int(numbers[1]), int(numbers[2])
            return f"#{r:02x}{g:02x}{b:02x}".upper()
    except:
        pass

    return rgb_string

def extract_all_colors(page):
    """Extrai todas as cores únicas da página"""
    colors = page.evaluate("""
        () => {
            const colors = new Set();
            const elements = document.querySelectorAll('*');

            elements.forEach(el => {
                const styles = window.getComputedStyle(el);

                // Background colors
                if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    colors.add(styles.backgroundColor);
                }

                // Text colors
                if (styles.color) {
                    colors.add(styles.color);
                }

                // Border colors
                if (styles.borderColor && styles.borderColor !== 'rgb(0, 0, 0)') {
                    colors.add(styles.borderColor);
                }
            });

            return Array.from(colors);
        }
    """)

    return colors

def extract_fonts(page):
    """Extrai todas as fontes utilizadas"""
    fonts = page.evaluate("""
        () => {
            const fonts = new Set();
            const elements = document.querySelectorAll('*');

            elements.forEach(el => {
                const styles = window.getComputedStyle(el);
                if (styles.fontFamily) {
                    fonts.add(styles.fontFamily);
                }
            });

            return Array.from(fonts);
        }
    """)

    return fonts

def main():
    print("🚀 Iniciando extração de design da página principal...")

    with sync_playwright() as p:
        # Iniciar browser
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Acessar a página
        print("\n📍 Acessando http://localhost:5173/...")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        page.wait_for_timeout(2000)  # Aguardar animações

        # Screenshot full page
        print("\n📸 Capturando screenshot full page...")
        page.screenshot(path="screenshots/home-full-page.png", full_page=True)

        # Screenshot viewport
        page.screenshot(path="screenshots/home-viewport.png")

        print("\n" + "="*80)
        print("1️⃣ ESTRUTURA GERAL DA PÁGINA")
        print("="*80)

        # Extrair estrutura básica
        structure = page.evaluate("""
            () => {
                const body = document.body;
                const layout = {
                    hasHeader: !!document.querySelector('header, nav, [class*="navbar"], [class*="header"]'),
                    hasHero: !!document.querySelector('[class*="hero"], [class*="banner"], main > section:first-child'),
                    hasSections: document.querySelectorAll('section, [class*="section"]').length,
                    hasFooter: !!document.querySelector('footer, [class*="footer"]'),
                    bodyWidth: body.offsetWidth,
                    bodyHeight: body.scrollHeight
                };
                return layout;
            }
        """)

        print(f"\n📐 Dimensões da página:")
        print(f"   - Largura: {structure['bodyWidth']}px")
        print(f"   - Altura total: {structure['bodyHeight']}px")
        print(f"\n🏗️  Estrutura detectada:")
        print(f"   - Header/Navbar: {'✅' if structure['hasHeader'] else '❌'}")
        print(f"   - Hero Section: {'✅' if structure['hasHero'] else '❌'}")
        print(f"   - Número de sections: {structure['hasSections']}")
        print(f"   - Footer: {'✅' if structure['hasFooter'] else '❌'}")

        print("\n" + "="*80)
        print("2️⃣ PALETA DE CORES COMPLETA")
        print("="*80)

        print("\n🎨 Extraindo cores...")
        all_colors = extract_all_colors(page)

        print(f"\n📊 {len(all_colors)} cores únicas encontradas:\n")

        color_map = {}
        for i, rgb_color in enumerate(all_colors[:20], 1):  # Top 20
            hex_color = rgb_to_hex(rgb_color)
            print(f"   {i:2d}. {rgb_color:30s} → {hex_color}")
            color_map[rgb_color] = hex_color

        print("\n" + "="*80)
        print("3️⃣ TIPOGRAFIA")
        print("="*80)

        print("\n🔤 Extraindo fontes...")
        all_fonts = extract_fonts(page)

        print(f"\n📊 {len(all_fonts)} famílias de fontes encontradas:\n")
        for i, font in enumerate(all_fonts, 1):
            print(f"   {i}. {font}")

        # Extrair tipografia de elementos principais
        typography_elements = {
            'h1': 'h1',
            'h2': 'h2',
            'h3': 'h3',
            'body': 'body',
            'paragraph': 'p',
            'button': 'button'
        }

        print("\n📏 Tamanhos de fonte por elemento:\n")
        for name, selector in typography_elements.items():
            try:
                if page.locator(selector).first.is_visible():
                    styles = extract_computed_styles(page, selector, [
                        'font-family', 'font-size', 'font-weight',
                        'line-height', 'letter-spacing'
                    ])
                    if styles:
                        print(f"   {name.upper()}:")
                        for prop, value in styles.items():
                            print(f"      - {prop}: {value}")
                        print()
            except:
                pass

        print("\n" + "="*80)
        print("4️⃣ BUSCADOR DE VOOS (PRIORIDADE MÁXIMA)")
        print("="*80)

        # Procurar formulário de busca
        search_selectors = [
            'form[class*="search"]',
            '[class*="flight-search"]',
            '[class*="search-form"]',
            'form',
            '[class*="buscador"]'
        ]

        search_form = None
        for selector in search_selectors:
            if page.locator(selector).first.is_visible():
                search_form = selector
                print(f"\n✅ Formulário encontrado: {selector}\n")
                break

        if search_form:
            # Screenshot do buscador
            print("📸 Capturando screenshot do buscador...")
            page.locator(search_form).first.screenshot(path="screenshots/search-form.png")

            # Extrair inputs
            inputs = page.locator(f"{search_form} input, {search_form} select").all()

            print(f"\n📝 {len(inputs)} campos de entrada encontrados:\n")

            for i, input_elem in enumerate(inputs, 1):
                try:
                    input_type = input_elem.get_attribute('type') or 'text'
                    placeholder = input_elem.get_attribute('placeholder') or ''
                    name = input_elem.get_attribute('name') or ''

                    styles = input_elem.evaluate("""
                        el => {
                            const s = window.getComputedStyle(el);
                            return {
                                width: s.width,
                                height: s.height,
                                padding: s.padding,
                                fontSize: s.fontSize,
                                borderRadius: s.borderRadius,
                                border: s.border,
                                backgroundColor: s.backgroundColor,
                                color: s.color
                            };
                        }
                    """)

                    print(f"   INPUT #{i}:")
                    print(f"      Type: {input_type}")
                    print(f"      Name: {name}")
                    print(f"      Placeholder: {placeholder}")
                    print(f"      Dimensões: {styles['width']} x {styles['height']}")
                    print(f"      Padding: {styles['padding']}")
                    print(f"      Font-size: {styles['fontSize']}")
                    print(f"      Border-radius: {styles['borderRadius']}")
                    print(f"      Background: {styles['backgroundColor']} → {rgb_to_hex(styles['backgroundColor'])}")
                    print(f"      Color: {styles['color']} → {rgb_to_hex(styles['color'])}")
                    print()
                except Exception as e:
                    print(f"   ⚠️  Erro ao extrair input #{i}: {e}\n")

            # Extrair botão de busca
            buttons = page.locator(f"{search_form} button").all()

            print(f"\n🔘 {len(buttons)} botões encontrados:\n")

            for i, btn in enumerate(buttons, 1):
                try:
                    text = btn.inner_text()

                    styles = btn.evaluate("""
                        el => {
                            const s = window.getComputedStyle(el);
                            return {
                                width: s.width,
                                height: s.height,
                                padding: s.padding,
                                fontSize: s.fontSize,
                                fontWeight: s.fontWeight,
                                borderRadius: s.borderRadius,
                                border: s.border,
                                backgroundColor: s.backgroundColor,
                                color: s.color,
                                boxShadow: s.boxShadow,
                                transition: s.transition
                            };
                        }
                    """)

                    print(f"   BOTÃO #{i}: '{text}'")
                    print(f"      Dimensões: {styles['width']} x {styles['height']}")
                    print(f"      Padding: {styles['padding']}")
                    print(f"      Font-size: {styles['fontSize']}")
                    print(f"      Font-weight: {styles['fontWeight']}")
                    print(f"      Border-radius: {styles['borderRadius']}")
                    print(f"      Background: {styles['backgroundColor']} → {rgb_to_hex(styles['backgroundColor'])}")
                    print(f"      Color: {styles['color']} → {rgb_to_hex(styles['color'])}")
                    print(f"      Box-shadow: {styles['boxShadow']}")
                    print(f"      Transition: {styles['transition']}")
                    print()

                    # Hover state
                    print(f"      🎯 Testando hover...")
                    btn.hover()
                    page.wait_for_timeout(500)

                    hover_styles = btn.evaluate("""
                        el => {
                            const s = window.getComputedStyle(el);
                            return {
                                backgroundColor: s.backgroundColor,
                                color: s.color,
                                transform: s.transform
                            };
                        }
                    """)

                    print(f"      HOVER STATE:")
                    print(f"         Background: {hover_styles['backgroundColor']} → {rgb_to_hex(hover_styles['backgroundColor'])}")
                    print(f"         Color: {hover_styles['color']} → {rgb_to_hex(hover_styles['color'])}")
                    print(f"         Transform: {hover_styles['transform']}")
                    print()
                except Exception as e:
                    print(f"   ⚠️  Erro ao extrair botão #{i}: {e}\n")

        print("\n" + "="*80)
        print("5️⃣ COMPONENTES PRINCIPAIS")
        print("="*80)

        # Navbar
        print("\n🧭 NAVBAR/HEADER:")
        navbar_selectors = ['header', 'nav', '[class*="navbar"]', '[class*="header"]']

        for selector in navbar_selectors:
            try:
                if page.locator(selector).first.is_visible():
                    styles = extract_computed_styles(page, selector, [
                        'height', 'background-color', 'padding', 'box-shadow',
                        'position', 'top', 'z-index'
                    ])

                    if styles:
                        print(f"\n   Selector: {selector}")
                        for prop, value in styles.items():
                            print(f"      {prop}: {value}")

                        # Screenshot
                        page.locator(selector).first.screenshot(path=f"screenshots/navbar.png")
                    break
            except:
                pass

        # Cards
        print("\n\n🃏 CARDS:")
        card_selectors = ['[class*="card"]', '[class*="feature"]', 'article']

        for selector in card_selectors:
            cards = page.locator(selector).all()
            if cards and len(cards) > 0:
                print(f"\n   {len(cards)} cards encontrados com selector: {selector}")

                # Extrair primeiro card como referência
                try:
                    styles = cards[0].evaluate("""
                        el => {
                            const s = window.getComputedStyle(el);
                            return {
                                width: s.width,
                                height: s.height,
                                padding: s.padding,
                                margin: s.margin,
                                borderRadius: s.borderRadius,
                                backgroundColor: s.backgroundColor,
                                boxShadow: s.boxShadow,
                                border: s.border
                            };
                        }
                    """)

                    print(f"\n   CARD (exemplo):")
                    for prop, value in styles.items():
                        print(f"      {prop}: {value}")

                    # Screenshot
                    cards[0].screenshot(path="screenshots/card-example.png")
                except:
                    pass
                break

        print("\n" + "="*80)
        print("6️⃣ ESPAÇAMENTO E GRID")
        print("="*80)

        # Detectar grid/flexbox usage
        grid_info = page.evaluate("""
            () => {
                const elements = document.querySelectorAll('*');
                let gridCount = 0;
                let flexCount = 0;

                elements.forEach(el => {
                    const display = window.getComputedStyle(el).display;
                    if (display === 'grid') gridCount++;
                    if (display === 'flex') flexCount++;
                });

                return { gridCount, flexCount };
            }
        """)

        print(f"\n📊 Uso de layout:")
        print(f"   - Elementos com display: grid → {grid_info['gridCount']}")
        print(f"   - Elementos com display: flex → {grid_info['flexCount']}")

        print("\n\n✅ Extração concluída!")
        print("\n📁 Screenshots salvos em:")
        print("   - screenshots/home-full-page.png")
        print("   - screenshots/home-viewport.png")
        print("   - screenshots/search-form.png")
        print("   - screenshots/navbar.png")
        print("   - screenshots/card-example.png")

        # Manter browser aberto para inspeção manual
        print("\n⏸️  Browser permanecerá aberto para inspeção manual.")
        print("   Pressione Ctrl+C para fechar.\n")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n👋 Fechando browser...")

        browser.close()

if __name__ == "__main__":
    # Criar pasta de screenshots
    import os
    os.makedirs("screenshots", exist_ok=True)

    main()
