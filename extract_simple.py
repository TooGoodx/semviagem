#!/usr/bin/env python3
"""Script simples de extração - output imediato"""

from playwright.sync_api import sync_playwright
import sys

print("🚀 Iniciando extração...", flush=True)

try:
    with sync_playwright() as p:
        print("📱 Abrindo browser...", flush=True)
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("🌐 Acessando http://localhost:5173/...", flush=True)
        page.goto("http://localhost:5173/", wait_until="domcontentloaded", timeout=30000)

        print("⏳ Aguardando página carregar...", flush=True)
        page.wait_for_timeout(3000)

        print("\n" + "="*80, flush=True)
        print("📸 SCREENSHOT", flush=True)
        print("="*80, flush=True)

        import os
        os.makedirs("screenshots", exist_ok=True)

        page.screenshot(path="screenshots/home.png", full_page=True)
        print("✅ Screenshot salvo: screenshots/home.png", flush=True)

        print("\n" + "="*80, flush=True)
        print("📏 INFORMAÇÕES BÁSICAS", flush=True)
        print("="*80, flush=True)

        title = page.title()
        print(f"\n🏷️  Título: {title}", flush=True)

        url = page.url
        print(f"🔗 URL: {url}", flush=True)

        # Extrair título H1
        try:
            h1 = page.locator('h1').first
            if h1.is_visible():
                h1_text = h1.inner_text()
                h1_styles = h1.evaluate("""el => {
                    const s = window.getComputedStyle(el);
                    return {
                        fontSize: s.fontSize,
                        fontWeight: s.fontWeight,
                        color: s.color,
                        fontFamily: s.fontFamily
                    };
                }""")
                print(f"\n📝 H1: '{h1_text}'", flush=True)
                print(f"   Font: {h1_styles['fontFamily']}", flush=True)
                print(f"   Size: {h1_styles['fontSize']}", flush=True)
                print(f"   Weight: {h1_styles['fontWeight']}", flush=True)
                print(f"   Color: {h1_styles['color']}", flush=True)
        except Exception as e:
            print(f"⚠️  H1 não encontrado: {e}", flush=True)

        # Extrair botões
        print("\n" + "="*80, flush=True)
        print("🔘 BOTÕES", flush=True)
        print("="*80, flush=True)

        buttons = page.locator('button').all()
        print(f"\n{len(buttons)} botões encontrados\n", flush=True)

        for i, btn in enumerate(buttons[:5], 1):  # Primeiros 5
            try:
                if btn.is_visible():
                    text = btn.inner_text()[:30]
                    styles = btn.evaluate("""el => {
                        const s = window.getComputedStyle(el);
                        return {
                            bg: s.backgroundColor,
                            color: s.color,
                            padding: s.padding,
                            borderRadius: s.borderRadius,
                            fontSize: s.fontSize
                        };
                    }""")
                    print(f"BOTÃO {i}: '{text}'", flush=True)
                    print(f"   BG: {styles['bg']}", flush=True)
                    print(f"   Color: {styles['color']}", flush=True)
                    print(f"   Padding: {styles['padding']}", flush=True)
                    print(f"   Border-radius: {styles['borderRadius']}", flush=True)
                    print(f"   Font-size: {styles['fontSize']}\n", flush=True)
            except:
                pass

        # Extrair inputs
        print("\n" + "="*80, flush=True)
        print("📝 INPUTS", flush=True)
        print("="*80, flush=True)

        inputs = page.locator('input').all()
        print(f"\n{len(inputs)} inputs encontrados\n", flush=True)

        for i, inp in enumerate(inputs[:5], 1):  # Primeiros 5
            try:
                if inp.is_visible():
                    placeholder = inp.get_attribute('placeholder') or ''
                    inp_type = inp.get_attribute('type') or 'text'
                    styles = inp.evaluate("""el => {
                        const s = window.getComputedStyle(el);
                        return {
                            width: s.width,
                            height: s.height,
                            padding: s.padding,
                            borderRadius: s.borderRadius,
                            fontSize: s.fontSize,
                            border: s.border
                        };
                    }""")
                    print(f"INPUT {i} (type: {inp_type})", flush=True)
                    print(f"   Placeholder: '{placeholder}'", flush=True)
                    print(f"   Size: {styles['width']} x {styles['height']}", flush=True)
                    print(f"   Padding: {styles['padding']}", flush=True)
                    print(f"   Border-radius: {styles['borderRadius']}", flush=True)
                    print(f"   Font-size: {styles['fontSize']}\n", flush=True)
            except:
                pass

        # Extrair cores principais
        print("\n" + "="*80, flush=True)
        print("🎨 CORES PRINCIPAIS", flush=True)
        print("="*80, flush=True)

        colors = page.evaluate("""() => {
            const colors = new Set();
            document.querySelectorAll('*').forEach(el => {
                const s = window.getComputedStyle(el);
                if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    colors.add(s.backgroundColor);
                }
            });
            return Array.from(colors).slice(0, 15);
        }""")

        print(f"\n{len(colors)} cores de fundo únicas:\n", flush=True)
        for i, color in enumerate(colors, 1):
            print(f"   {i:2d}. {color}", flush=True)

        print("\n\n✅ Extração concluída!", flush=True)
        print("📁 Screenshot salvo em screenshots/home.png", flush=True)
        print("\n⏸️  Pressione Ctrl+C no terminal para fechar o browser...\n", flush=True)

        # Manter aberto
        try:
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass

        browser.close()

except Exception as e:
    print(f"\n❌ ERRO: {e}", flush=True)
    sys.exit(1)
