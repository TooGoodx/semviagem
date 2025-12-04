# PLANO DE CORREÇÃO - HERO SECTION

## Estrutura Atual (ERRADA):
```tsx
<div className="container mx-auto...">  ←1356
  <div className="flex justify-center"> ←1357
    <div className="max-w-4xl">  ←1358 LIMITA TUDO!
      <h1>TÍTULO</h1>
      <p>SUBTÍTULO</p>
      <div id="form" className="max-w-4xl">FORM</div>  ←1369
    </div>  ←fecha em ~1700
  </div>
</div>
```

## Estrutura Correta (OBJETIVO):
```tsx
<div className="container mx-auto pb-16 pt-24 px-8 sm:px-12 lg:px-16">  ←1356
  <div className="flex justify-center">  ←1357
    <div className="max-w-5xl">  ←1358
      <h1>TÍTULO NOVO</h1>
      <p>SUBTÍTULO NOVO</p>
    </div>  ←FECHA AQUI ~1366
  </div>  ←fecha ~1367

  <div id="form" className="max-w-7xl mx-auto">FORM</div>  ←FORA DO MAX-W-5XL
</div>
```

## Mudanças necessárias:

1. LINHA 1356: Atualizar padding
   - DE: `pb-12 pt-20`
   - PARA: `pb-16 pt-24 px-8 sm:px-12 lg:px-16`

2. LINHA 1358: Aumentar limite de texto
   - DE: `max-w-4xl`
   - PARA: `max-w-5xl mx-auto`

3. LINHA 1359-1361: Atualizar título
   - Novo copy com cores #F0C730 e #4896C7
   - Tamanhos: text-4xl md:text-5xl lg:text-6xl

4. LINHA 1362-1366: Atualizar subtítulo
   - Novo copy com Playfair Display
   - Remover terceiro texto
   - Fechar </div> do max-w-5xl

5. LINHA ~1367: Fechar </div> do flex

6. LINHA 1368-1369: Formulário fora
   - PARA: max-w-7xl mx-auto
   - Card: rounded-3xl shadow-2xl
   - CardContent: p-10 md:p-12
