#!/usr/bin/env python3
"""
Script para extração completa e detalhada de design de uma página web.
Extrai todos os valores CSS, cores, tipografia, espaçamentos, etc.
"""

import json
import sys
from playwright.sync_api import sync_playwright
import time

def extract_computed_styles(page, selector):
    """Extrai os estilos computados de um elemento."""
    try:
        return page.evaluate(f'''() => {{
            const element = document.querySelector('{selector}');
            if (!element) return null;

            const styles = window.getComputedStyle(element);
            return {{
                // Cores
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                borderColor: styles.borderColor,

                // Tipografia
                fontFamily: styles.fontFamily,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                lineHeight: styles.lineHeight,
                letterSpacing: styles.letterSpacing,
                textAlign: styles.textAlign,

                // Box Model
                width: styles.width,
                height: styles.height,
                margin: styles.margin,
                marginTop: styles.marginTop,
                marginRight: styles.marginRight,
                marginBottom: styles.marginBottom,
                marginLeft: styles.marginLeft,
                padding: styles.padding,
                paddingTop: styles.paddingTop,
                paddingRight: styles.paddingRight,
                paddingBottom: styles.paddingBottom,
                paddingLeft: styles.paddingLeft,

                // Bordas
                border: styles.border,
                borderWidth: styles.borderWidth,
                borderStyle: styles.borderStyle,
                borderRadius: styles.borderRadius,

                // Sombras
                boxShadow: styles.boxShadow,
                textShadow: styles.textShadow,

                // Display & Position
                display: styles.display,
                position: styles.position,
                flexDirection: styles.flexDirection,
                justifyContent: styles.justifyContent,
                alignItems: styles.alignItems,
                gap: styles.gap,
                gridTemplateColumns: styles.gridTemplateColumns,
                gridGap: styles.gridGap,

                // Transições e Animações
                transition: styles.transition,
                transform: styles.transform,

                // Outros
                opacity: styles.opacity,
                cursor: styles.cursor,
                overflow: styles.overflow,
                zIndex: styles.zIndex
            }};
        }}''')
    except Exception as e:
        print(f"Erro ao extrair estilos de {selector}: {e}")
        return None

def get_all_selectors(page):
    """Extrai todos os seletores importantes da página."""
    return page.evaluate('''() => {
        const selectors = [];

        // IDs
        document.querySelectorAll('[id]').forEach(el => {
            selectors.push('#' + el.id);
        });

        // Classes importantes (evitar duplicatas)
        const classSet = new Set();
        document.querySelectorAll('[class]').forEach(el => {
            const classes = el.className.toString().split(' ').filter(c => c);
            classes.forEach(cls => {
                if (!classSet.has(cls)) {
                    classSet.add(cls);
                    selectors.push('.' + cls);
                }
            });
        });

        // Tags importantes
        ['nav', 'header', 'main', 'footer', 'section', 'article', 'button', 'input', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a'].forEach(tag => {
            if (document.querySelector(tag)) {
                selectors.push(tag);
            }
        });

        return selectors;
    }''')

def extract_page_structure(page):
    """Extrai a estrutura completa da página."""
    return page.evaluate('''() => {
        function getElementInfo(element, depth = 0) {
            if (depth > 10) return null; // Limitar profundidade

            const info = {
                tag: element.tagName.toLowerCase(),
                id: element.id || null,
                classes: element.className ? element.className.toString().split(' ').filter(c => c) : [],
                text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3
                      ? element.textContent.trim().substring(0, 100)
                      : null,
                attributes: {}
            };

            // Atributos importantes
            ['href', 'src', 'alt', 'title', 'placeholder', 'type', 'value', 'name'].forEach(attr => {
                if (element.hasAttribute(attr)) {
                    info.attributes[attr] = element.getAttribute(attr);
                }
            });

            // Recursivamente para filhos (limitado)
            if (depth < 5 && element.children.length > 0 && element.children.length < 20) {
                info.children = Array.from(element.children)
                    .map(child => getElementInfo(child, depth + 1))
                    .filter(c => c !== null);
            }

            return info;
        }

        return getElementInfo(document.body);
    }''')

def extract_flight_search_form(page):
    """Extrai informações detalhadas do formulário de busca de voos."""
    return page.evaluate('''() => {
        // Procurar por formulário de busca de voos
        const form = document.querySelector('form') ||
                    document.querySelector('[class*="search"]') ||
                    document.querySelector('[class*="flight"]') ||
                    document.querySelector('[class*="busca"]');

        if (!form) return null;

        const inputs = Array.from(form.querySelectorAll('input, select, button')).map(el => {
            const styles = window.getComputedStyle(el);
            return {
                tag: el.tagName.toLowerCase(),
                type: el.type || null,
                id: el.id || null,
                name: el.name || null,
                classes: el.className ? el.className.toString() : '',
                placeholder: el.placeholder || null,
                value: el.value || null,
                text: el.textContent.trim() || null,
                styles: {
                    backgroundColor: styles.backgroundColor,
                    color: styles.color,
                    border: styles.border,
                    borderRadius: styles.borderRadius,
                    padding: styles.padding,
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    width: styles.width,
                    height: styles.height,
                    margin: styles.margin,
                    boxShadow: styles.boxShadow,
                    cursor: styles.cursor
                }
            };
        });

        const formStyles = window.getComputedStyle(form);

        return {
            formId: form.id || null,
            formClasses: form.className ? form.className.toString() : '',
            formStyles: {
                backgroundColor: formStyles.backgroundColor,
                padding: formStyles.padding,
                borderRadius: formStyles.borderRadius,
                boxShadow: formStyles.boxShadow,
                display: formStyles.display,
                flexDirection: formStyles.flexDirection,
                gap: formStyles.gap,
                width: formStyles.width,
                margin: formStyles.margin
            },
            inputs: inputs
        };
    }''')

def extract_all_colors(page):
    """Extrai todas as cores únicas usadas na página."""
    return page.evaluate('''() => {
        const colors = new Set();
        const elements = document.querySelectorAll('*');

        elements.forEach(el => {
            const styles = window.getComputedStyle(el);

            // Cores de fundo
            if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                colors.add(styles.backgroundColor);
            }

            // Cores de texto
            if (styles.color) {
                colors.add(styles.color);
            }

            // Cores de borda
            if (styles.borderColor && styles.borderColor !== 'rgb(0, 0, 0)') {
                colors.add(styles.borderColor);
            }
        });

        return Array.from(colors);
    }''')

def extract_all_fonts(page):
    """Extrai todas as fontes únicas usadas na página."""
    return page.evaluate('''() => {
        const fonts = new Map();
        const elements = document.querySelectorAll('*');

        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const fontKey = `${styles.fontFamily}_${styles.fontSize}_${styles.fontWeight}`;

            if (!fonts.has(fontKey)) {
                fonts.set(fontKey, {
                    fontFamily: styles.fontFamily,
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    lineHeight: styles.lineHeight,
                    elements: el.tagName.toLowerCase()
                });
            }
        });

        return Array.from(fonts.values());
    }''')

def rgb_to_hex(rgb_string):
    """Converte RGB para HEX."""
    try:
        if rgb_string.startswith('#'):
            return rgb_string

        if 'rgba' in rgb_string or 'rgb' in rgb_string:
            # Extrair números
            import re
            numbers = re.findall(r'\d+', rgb_string)
            if len(numbers) >= 3:
                r, g, b = int(numbers[0]), int(numbers[1]), int(numbers[2])
                return f'#{r:02x}{g:02x}{b:02x}'.upper()

        return rgb_string
    except:
        return rgb_string

def main():
    url = "https://extraordinary-starship-9103ce.netlify.app"

    print("Iniciando extração de design da página...")
    print(f"URL: {url}\n")

    with sync_playwright() as p:
        # Iniciar navegador
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # Acessar página
            print("Acessando página...")
            page.goto(url, wait_until='networkidle', timeout=30000)
            time.sleep(2)  # Aguardar carregamento completo

            # Screenshot full page
            print("Capturando screenshot da página completa...")
            page.screenshot(path='/Users/bruno/Downloads/buscadorReact-main/screenshot_fullpage.png', full_page=True)

            # Screenshot viewport
            print("Capturando screenshot do viewport...")
            page.screenshot(path='/Users/bruno/Downloads/buscadorReact-main/screenshot_viewport.png')

            # Extrair estrutura da página
            print("Extraindo estrutura da página...")
            page_structure = extract_page_structure(page)

            # Extrair formulário de busca de voos
            print("Extraindo formulário de busca de voos...")
            flight_form = extract_flight_search_form(page)

            # Extrair todas as cores
            print("Extraindo todas as cores...")
            all_colors = extract_all_colors(page)

            # Extrair todas as fontes
            print("Extraindo todas as fontes...")
            all_fonts = extract_all_fonts(page)

            # Extrair seletores importantes
            print("Extraindo seletores...")
            selectors = get_all_selectors(page)

            # Extrair estilos de elementos específicos
            print("Extraindo estilos de elementos específicos...")
            specific_styles = {}

            important_selectors = [
                'nav', 'header', 'main', 'footer',
                'h1', 'h2', 'h3', 'p',
                'button', 'input', 'form',
                'a', '.btn', '.button',
                '[class*="search"]', '[class*="flight"]',
                '[class*="hero"]', '[class*="card"]',
                '[class*="navbar"]', '[class*="nav"]'
            ]

            for selector in important_selectors:
                try:
                    if page.query_selector(selector):
                        specific_styles[selector] = extract_computed_styles(page, selector)
                except:
                    pass

            # Extrair informações de botões (hover states)
            print("Testando estados de hover em botões...")
            buttons_info = page.evaluate('''() => {
                const buttons = document.querySelectorAll('button, .btn, .button, [role="button"]');
                return Array.from(buttons).map((btn, index) => {
                    const styles = window.getComputedStyle(btn);
                    return {
                        index: index,
                        text: btn.textContent.trim(),
                        classes: btn.className.toString(),
                        id: btn.id || null,
                        styles: {
                            backgroundColor: styles.backgroundColor,
                            color: styles.color,
                            border: styles.border,
                            borderRadius: styles.borderRadius,
                            padding: styles.padding,
                            fontSize: styles.fontSize,
                            fontWeight: styles.fontWeight,
                            cursor: styles.cursor,
                            boxShadow: styles.boxShadow,
                            transition: styles.transition
                        }
                    };
                });
            }''')

            # Capturar screenshots de seções importantes
            print("Capturando screenshots de seções específicas...")

            # Tentar capturar seção de busca de voos
            try:
                search_element = page.query_selector('form, [class*="search"], [class*="flight"], [class*="busca"]')
                if search_element:
                    search_element.screenshot(path='/Users/bruno/Downloads/buscadorReact-main/screenshot_search.png')
            except:
                pass

            # Tentar capturar header
            try:
                header = page.query_selector('header, nav, [class*="header"], [class*="navbar"]')
                if header:
                    header.screenshot(path='/Users/bruno/Downloads/buscadorReact-main/screenshot_header.png')
            except:
                pass

            # Compilar todos os dados
            print("Compilando dados...")
            data = {
                'url': url,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'viewport': {'width': 1920, 'height': 1080},
                'page_structure': page_structure,
                'flight_search_form': flight_form,
                'all_colors': all_colors,
                'all_fonts': all_fonts,
                'specific_styles': specific_styles,
                'buttons_info': buttons_info,
                'page_title': page.title(),
                'page_html': page.content()[:5000]  # Primeiros 5000 caracteres
            }

            # Salvar dados em JSON
            print("Salvando dados em JSON...")
            with open('/Users/bruno/Downloads/buscadorReact-main/design_extraction.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print("\n✓ Extração concluída com sucesso!")
            print(f"✓ Screenshots salvos")
            print(f"✓ Dados salvos em design_extraction.json")
            print(f"\nTotal de cores encontradas: {len(all_colors)}")
            print(f"Total de variações de fonte: {len(all_fonts)}")
            print(f"Total de botões: {len(buttons_info)}")

        except Exception as e:
            print(f"Erro durante extração: {e}")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

if __name__ == "__main__":
    main()
