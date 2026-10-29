# Chess Copilot na Vercel

## Executar localmente
```bash
npm install
npm run dev
```
Para usar o motor localmente antes do primeiro `npm run dev`, execute `npm run prepare-engine`.

## Publicar
Envie esta pasta para um repositório GitHub e importe o repositório em vercel.com/new. A Vercel usa `npm run build`, que copia os arquivos do Stockfish para `public/engine` antes de compilar. Diretório de saída: `dist`.

## Modos
- Análise: explore livremente as posições e variantes.
- Jogar vs Stockfish: jogue com as brancas e o motor responde com as pretas.

Use apenas em treino e ambientes que permitem assistência externa.
