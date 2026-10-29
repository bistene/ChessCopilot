import { Chess } from 'chess.js';
import './style.css';
const app=document.querySelector('#app');
const game=new Chess();
const glyph={wk:'♔',wq:'♕',wr:'♖',wb:'♗',wn:'♘',wp:'♙',bk:'♚',bq:'♛',br:'♜',bb:'♝',bn:'♞',bp:'♟'};
const state={mode:'play',human:'w',selected:null,depth:15,lines:3,engine:null,ready:false,analysis:[],score:null,thinking:false,fen:'',orientation:'w',timer:null,searchId:0,enabled:true,bestVisible:true,searchFen:null,pendingSearch:false,coachLevel:0,coachRevealed:false,arrows:true,skill:12,minutes:10,clock:{w:600,b:600},clockRunning:false,clockLast:0,review:[],reviewOpen:false,fullReview:[],reviewWorker:null,reviewBusy:false,engineScript:null,training:null,savedKey:'chesscopilot-history-v1',lastSavedPgn:null,liveEnabled:true,liveSuggestions:true,liveWorker:null,liveFen:null,liveReady:false,liveDepth:18};
app.innerHTML=`<header><div class="brand">♞ <span>CHESS<span class="accent">COPILOT</span></span></div><span class="tag">STOCKFISH • ESTUDO E TREINO</span></header><main><section class="board-panel"><div class="board-top"><span id="turn"></span><span id="status">Iniciando motor…</span></div><div class="game-setup"><label>Dificuldade <select id="skill"><option value="2">Iniciante</option><option value="7">Intermediário</option><option value="12" selected>Avançado</option><option value="20">Mestre</option></select></label><label>Sua cor <select id="side"><option value="w">Brancas</option><option value="b">Pretas</option></select></label><label>Relógio <select id="time"><option value="0">Sem tempo</option><option value="3">3 minutos</option><option value="5">5 minutos</option><option value="10" selected>10 minutos</option><option value="15">15 minutos</option></select></label></div><div class="clock-row"><span id="clock-b">Pretas 10:00</span><span id="clock-w">Brancas 10:00</span></div><div class="board-wrap"><div class="board-shell"><div id="board" class="board"></div><svg id="arrows" class="arrows" viewBox="0 0 800 800" aria-label="Setas dos melhores lances"></svg></div></div><div class="actions"><button id="mode">Modo: Jogar vs Stockfish</button><button id="undo">↶ Voltar</button><button id="reset">↻ Reiniciar</button><button id="flip">⇅ Girar</button><button id="best">Ocultar melhor lance</button><button id="toggle-arrows">Setas: ligadas</button></div><div class="import"><label for="fen">Posição FEN</label><div class="inline"><input id="fen" placeholder="Cole uma posição FEN"/><button id="loadFen">Carregar</button></div><label for="pgn">Importar PGN</label><textarea id="pgn" rows="3" placeholder="Cole aqui uma partida PGN..."></textarea><button id="loadPgn">Importar partida</button></div></section><aside><div class="panel"><div class="panel-title"><h2>Análise ao vivo</h2><span id="engine-state" class="live">● Aguardando</span></div><div class="live-controls"><label><input type="checkbox" id="live-toggle" checked/> Análise contínua</label><label><input type="checkbox" id="suggest-toggle" checked/> Mostrar sugestões</label><span id="live-status" class="live">● Preparando</span></div><div class="eval"><div id="eval-text">0.00</div><div id="eval-desc">Posição equilibrada</div></div><div class="meter"><div id="meter-white"></div></div><div class="controls"><label>Profundidade <strong id="depth-value">15</strong><input type="range" id="depth" min="8" max="22" value="15"/></label><label>Variantes <select id="lines"><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option></select></label></div><div id="best-move" class="best-move">Melhor lance: calculando…</div><div id="variations" class="variations"><p class="muted">Aguardando análise...</p></div></div><div class="panel coach-panel"><div class="panel-title"><h2>♟ Treinador inteligente</h2><span class="live">PISTAS GRADUAIS</span></div><p id="coach">Observe a posição e tente descobrir o plano.</p><div id="coach-detail" class="coach-detail">Peça uma pista para começar.</div><div class="actions"><button id="hint">💡 Pedir pista</button><button id="reveal">Revelar lance</button><button id="coach-reset">Recomeçar dicas</button></div><div class="hint">As dicas usam as variantes do Stockfish e conceitos de xadrez; não são uma análise de linguagem por IA.</div></div><div class="panel"><div class="panel-title"><h2>Revisão de partida</h2><span class="live">AVALIAÇÕES REGISTRADAS</span></div><canvas id="review-chart" width="600" height="190" aria-label="Gráfico da avaliação durante a partida"></canvas><p id="review-summary" class="muted">Jogue para registrar avaliações.</p><div class="actions"><button id="review">Revisar lances</button><button id="full-review">Analisar partida completa</button></div><div id="review-list" class="review-list"></div></div><div class="panel"><div class="panel-title"><h2>Meu progresso</h2><span class="live">SALVO NESTE NAVEGADOR</span></div><div id="stats" class="stats"></div><div id="openings" class="openings"></div><div class="actions"><button id="save-game">Salvar partida</button><button id="export-history">Exportar histórico</button><button id="clear-history">Limpar histórico</button></div><div id="saved-games" class="review-list"></div></div><div class="panel"><div class="panel-title"><h2>Treino dos meus erros</h2><span class="live">TÁTICAS PERSONALIZADAS</span></div><p id="training-status" class="muted">Faça uma revisão completa para gerar exercícios a partir dos seus erros.</p><div class="actions"><button id="training-start">Treinar meus erros</button><button id="training-hint">Pista</button><button id="training-stop">Encerrar treino</button></div></div><div class="panel"><h2>Histórico</h2><div id="history" class="history muted">Nenhum lance ainda.</div><div class="actions"><button id="copyFen">Copiar FEN</button><button id="copyPgn">Copiar PGN</button></div></div></aside></main><footer>Para análise de partidas próprias, treino e jogos com assistência permitida. Não use em partidas competitivas que proíbem ajuda externa.</footer><div id="toast" role="status"></div>`;
const $=id=>document.getElementById(id);
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3200)}
function squares(){let files='abcdefgh'.split('');if(state.orientation==='b')files.reverse();let ranks=state.orientation==='w'?[8,7,6,5,4,3,2,1]:[1,2,3,4,5,6,7,8];return ranks.flatMap(r=>files.map(f=>f+r))}
function draw(){const legal=state.selected?game.moves({square:state.selected,verbose:true}).map(m=>m.to):[];const last=game.history({verbose:true}).at(-1);const best=state.liveSuggestions&&state.bestVisible&&state.coachRevealed?state.analysis[0]?.uci:null;$('board').innerHTML=squares().map(s=>{const p=game.get(s),file=s.charCodeAt(0)-97,rank=Number(s[1]),dark=(file+rank)%2===0;return `<button class="square ${dark?'dark':'light'} ${state.selected===s?'selected':''} ${best?.slice(0,2)===s?'best-from':''} ${best?.slice(2,4)===s?'best-to':''} ${legal.includes(s)?'target':''} ${last&&(last.from===s||last.to===s)?'last':''}" data-square="${s}" aria-label="${s} ${p?p.color+p.type:'vazio'}"><span class="piece ${p?.color==='w'?'white-piece':'black-piece'}">${p?glyph[p.color+p.type]:''}</span>${(state.orientation==='w'?file===0:file===7)?`<small class="rank">${rank}</small>`:''}${(state.orientation==='w'?rank===1:rank===8)?`<small class="file">${s[0]}</small>`:''}</button>`}).join('');$('turn').textContent=game.isCheckmate()?'Xeque-mate':game.isDraw()?'Empate':game.isCheck()?'Xeque • '+(game.turn()==='w'?'Brancas':'Pretas'):'Vez das '+(game.turn()==='w'?'brancas':'pretas');$('history').innerHTML=game.history().length?game.history().map((m,i)=>`<span class="move">${i%2===0?`${Math.floor(i/2)+1}. `:''}${m}</span>`).join(' '):'Nenhum lance ainda.';$('fen').value=game.fen();renderArrows()}
function move(from,to){if(state.mode==='play'&&(game.turn()!==state.human||state.thinking))return;const moves=game.moves({square:from,verbose:true}).filter(m=>m.to===to);if(!moves.length)return;let promotion='q';if(moves.some(m=>m.promotion)){const pick=prompt('Promoção: q (dama), r (torre), b (bispo), n (cavalo)','q');if(pick===null)return;promotion=['q','r','b','n'].includes(pick?.toLowerCase())?pick.toLowerCase():'q'}try{game.move({from,to,promotion});state.clockRunning=true;state.clockLast=Date.now();state.selected=null;resetCoach();checkTraining();draw();analyze()}catch(e){toast('Movimento inválido')}}
$('board').addEventListener('click',e=>{const s=e.target.closest('[data-square]')?.dataset.square;if(!s)return;if(state.mode==='play'&&(game.turn()!==state.human||state.thinking))return;const p=game.get(s);if(state.selected&&s!==state.selected&&game.moves({square:state.selected,verbose:true}).some(m=>m.to===s)){move(state.selected,s);return}state.selected=p?.color===game.turn()?(state.selected===s?null:s):null;draw()});
$('mode').onclick=()=>{state.mode=state.mode==='study'?'play':'study';$('mode').textContent=state.mode==='play'?'Modo: Jogar vs Stockfish':'Modo: Análise';game.reset();resetMatch();state.selected=null;resetCoach();draw();analyze()};$('undo').onclick=()=>{game.undo();if(state.mode==='play'&&game.turn()!==state.human)game.undo();state.review=state.review.filter(x=>x.ply<=game.history().length);state.selected=null;resetCoach();draw();renderReview();analyze()};$('reset').onclick=()=>{game.reset();resetMatch();state.selected=null;resetCoach();draw();analyze()};$('flip').onclick=()=>{state.orientation=state.orientation==='w'?'b':'w';draw()};$('depth').oninput=e=>{$('depth-value').textContent=e.target.value;state.depth=Number(e.target.value);schedule()};$('lines').onchange=e=>{state.lines=Number(e.target.value);schedule()};
$('loadFen').onclick=()=>{try{game.load($('fen').value.trim());resetMatch();state.selected=null;resetCoach();draw();analyze()}catch{toast('FEN inválida')}};
$('loadPgn').onclick=()=>{try{game.loadPgn($('pgn').value);resetMatch();state.selected=null;resetCoach();draw();analyze();toast('PGN importado')}catch{toast('PGN inválido')}};
$('copyFen').onclick=()=>navigator.clipboard.writeText(game.fen()).then(()=>toast('FEN copiada'));
$('copyPgn').onclick=()=>navigator.clipboard.writeText(game.pgn()).then(()=>toast('PGN copiado'));
$('best').onclick=()=>{state.bestVisible=!state.bestVisible;state.coachRevealed=state.bestVisible;$('best').textContent=state.bestVisible?'Ocultar melhor lance':'Mostrar melhor lance';updateAnalysis();draw()};$('toggle-arrows').onclick=()=>{state.arrows=!state.arrows;$('toggle-arrows').textContent=state.arrows?'Setas: ligadas':'Setas: desligadas';renderArrows()};$('hint').onclick=()=>{state.coachLevel=Math.min(3,state.coachLevel+1);renderCoach()};$('reveal').onclick=()=>{state.coachRevealed=true;state.bestVisible=true;$('best').textContent='Ocultar melhor lance';renderCoach();draw()};$('coach-reset').onclick=()=>{resetCoach();renderCoach();draw()};
function resetMatch(){state.clock={w:state.minutes*60,b:state.minutes*60};state.clockRunning=false;state.clockLast=0;state.review=[];state.fullReview=[];state.training=null;if(state.reviewWorker){state.reviewWorker.terminate();state.reviewWorker=null}state.reviewBusy=false;renderClocks();renderReview()}
function formatTime(sec){const t=Math.max(0,Math.ceil(sec));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')}
function renderClocks(){$('clock-w').textContent='Brancas '+(state.minutes?formatTime(state.clock.w):'∞');$('clock-b').textContent='Pretas '+(state.minutes?formatTime(state.clock.b):'∞')}
setInterval(()=>{if(!state.clockRunning||!state.minutes||game.isGameOver()||state.mode!=='play')return;const now=Date.now(),dt=(now-state.clockLast)/1000;state.clockLast=now;state.clock[game.turn()]-=dt;renderClocks();if(state.clock[game.turn()]<=0){state.clockRunning=false;state.engine?.postMessage('stop');$('status').textContent='Tempo esgotado: '+(game.turn()==='w'?'brancas':'pretas');toast('Tempo esgotado!')}},250);
$('skill').onchange=e=>{state.skill=Number(e.target.value);analyze()};
$('side').onchange=e=>{state.human=e.target.value;state.orientation=state.human;game.reset();resetMatch();resetCoach();draw();analyze()};
$('time').onchange=e=>{state.minutes=Number(e.target.value);resetMatch()};
$('review').onclick=()=>{state.reviewOpen=!state.reviewOpen;$('review').textContent=state.reviewOpen?'Ocultar revisão':'Revisar lances';renderReview()};$('full-review').onclick=()=>fullReview();
function recordEval(){
 if(!state.analysis[0]||state.mode!=='play')return;
 const a=state.analysis[0],ply=game.history().length,cp=a.mate!==undefined?(a.mate>0?1000:-1000):(a.cp||0);
 const whiteCp=cp*(game.turn()==='w'?1:-1);
 const last=state.review.find(x=>x.ply===ply);
 if(last){if(a.depth<last.depth)return;Object.assign(last,{cp:whiteCp,depth:a.depth})}
 else state.review.push({ply,cp:whiteCp,depth:a.depth,san:game.history().at(-1)||'Início'});
 renderReview();
}
function getSaved(){try{return JSON.parse(localStorage.getItem(state.savedKey)||'[]')}catch{return []}}
function saveCurrent(){const pgn=game.pgn();if(!game.history().length)return toast('Não há partida para salvar');const items=getSaved();if(items.some(x=>x.pgn===pgn))return toast('Essa partida já foi salva');let result='Em andamento';if(game.isCheckmate())result=game.turn()===state.human?'Derrota':'Vitória';else if(game.isDraw())result='Empate';const entry={date:new Date().toISOString(),pgn,result,side:state.human,moves:game.history().length,opening:openingName(game.history())};items.unshift(entry);try{localStorage.setItem(state.savedKey,JSON.stringify(items.slice(0,100)));renderProgress();toast('Partida salva neste navegador')}catch{toast('Armazenamento indisponível')}}
function openingName(m){const a=m.slice(0,3).join(' ');if(a.startsWith('e4 e5 Nf3'))return 'Jogo aberto';if(a.startsWith('e4 c5'))return 'Defesa Siciliana';if(a.startsWith('e4 e6'))return 'Defesa Francesa';if(a.startsWith('e4 c6'))return 'Defesa Caro-Kann';if(a.startsWith('d4 d5'))return 'Jogo do Peão da Dama';if(a.startsWith('d4 Nf6'))return 'Defesa Indiana';if(a.startsWith('e4'))return 'Abertura do Peão do Rei';if(a.startsWith('d4'))return 'Abertura do Peão da Dama';return 'Outras aberturas'}
function renderProgress(){const games=getSaved(),finished=games.filter(g=>g.result!=='Em andamento');const count=v=>finished.filter(g=>g.result===v).length;const openings={};for(const g of games)openings[g.opening]=(openings[g.opening]||0)+1;
 $('stats').innerHTML='<div><strong>'+games.length+'</strong><small>Partidas</small></div><div><strong>'+count('Vitória')+'</strong><small>Vitórias</small></div><div><strong>'+count('Derrota')+'</strong><small>Derrotas</small></div><div><strong>'+count('Empate')+'</strong><small>Empates</small></div>';
 $('openings').textContent='Aberturas frequentes: '+(Object.entries(openings).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]+' ('+x[1]+')').join(' · ')||'nenhuma');
 $('saved-games').innerHTML=games.slice(0,12).map((g,i)=>'<div class="review-entry"><span>'+new Date(g.date).toLocaleDateString('pt-BR')+' · '+g.result+' · '+g.opening+'</span><button data-load-game="'+i+'">Abrir</button></div>').join('')||'<p class="muted">Nenhuma partida salva.</p>';
}
$('save-game').onclick=saveCurrent;
$('saved-games').onclick=e=>{const id=e.target.closest('[data-load-game]')?.dataset.loadGame;if(id===undefined)return;const item=getSaved()[Number(id)];if(!item)return;try{game.loadPgn(item.pgn);resetMatch();draw();analyze();toast('Partida carregada')}catch{toast('Não foi possível abrir a partida')}};
$('export-history').onclick=()=>{const blob=new Blob([JSON.stringify(getSaved(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='chesscopilot-historico.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('clear-history').onclick=()=>{if(!confirm('Apagar o histórico salvo neste navegador?'))return;localStorage.removeItem(state.savedKey);renderProgress()};
function renderTraining(){$('training-status').textContent=state.training?'Treino ativo: encontre o melhor lance para corrigir um erro da sua partida.':'Revise uma partida e clique em Treinar meus erros.'}
$('training-start').onclick=()=>{const candidates=state.fullReview.filter(x=>['❌ Erro grave','⚠ Erro','Imprecisão'].includes(x.label)&&x.bestUci&&x.bestUci!==x.playedUci);if(!candidates.length)return toast('Revise uma partida com erros para gerar exercícios');const item=candidates[Math.floor(Math.random()*candidates.length)];state.training={best:item.bestUci,fen:item.fen};state.mode='study';$('mode').textContent='Modo: Análise';game.load(item.fen);state.selected=null;resetCoach();draw();analyze();renderTraining()};
$('training-hint').onclick=()=>{if(!state.training)return toast('Inicie um exercício');toast('Considere a peça em '+state.training.best.slice(0,2))};
$('training-stop').onclick=()=>{state.training=null;renderTraining()};
function checkTraining(){if(!state.training)return;const last=game.history({verbose:true}).at(-1);if(!last)return;const u=last.from+last.to+(last.promotion||'');toast(u===state.training.best?'Correto! Você encontrou o melhor lance.':'Tente novamente ou peça uma pista.');state.training=null;renderTraining()}
function fullReview(){
 if(state.reviewBusy||!state.ready||!state.engineScript){toast('Aguarde o motor ficar pronto');return}
 const moves=game.history({verbose:true});if(!moves.length){toast('Jogue ou importe uma partida primeiro');return}
 const replay=new Chess();const positions=[replay.fen()];
 for(const m of moves){replay.move(m);positions.push(replay.fen())}
 const worker=new Worker('/engine/'+state.engineScript);state.reviewWorker=worker;state.reviewBusy=true;state.fullReview=[];renderReview();
 let index=0,score=null,searching=false,ready=false,previousScore=0;const bestByPosition=[];let bestMove=null;
 const stop=()=>{worker.terminate();if(state.reviewWorker===worker)state.reviewWorker=null;state.reviewBusy=false;renderReview();renderTraining()};
 worker.onerror=()=>{stop();toast('Falha no motor de revisão')};
 const next=()=>{if(index>=positions.length){stop();toast('Revisão concluída');return}score=null;bestMove=null;searching=true;worker.postMessage('position fen '+positions[index]);worker.postMessage('go depth '+Math.min(state.depth,12))};
 worker.onmessage=e=>{for(const line of String(e.data).split(/\r?\n/)){
  if(line==='uciok'){worker.postMessage('setoption name MultiPV value 1');worker.postMessage('setoption name Skill Level value 20');worker.postMessage('isready')}
  else if(line==='readyok'&&!ready){ready=true;next()}
  else if(searching&&line.startsWith('info ')&&line.includes(' score ')){
   const cp=line.match(/\bscore cp (-?\d+)/),mate=line.match(/\bscore mate (-?\d+)/);
   if(cp||mate){bestMove=line.split(' pv ')[1]?.trim().split(/\s+/)[0]||bestMove;const value=cp?Number(cp[1]):(Number(mate[1])>0?1000:-1000);score=value*(index%2===0?1:-1)}
  }else if(searching&&line.startsWith('bestmove ')){
   searching=false;
   const cp=score??(state.fullReview.at(-1)?.cp??0);
   if(index>0){
    const previous=previousScore;
    const mover=index%2===1?1:-1;
    const loss=Math.max(0,(previous-cp)*mover);
    const label=loss>=250?'❌ Erro grave':loss>=110?'⚠ Erro':loss>=50?'Imprecisão':loss<=15?'✓ Bom lance':'Lance aceitável';
    state.fullReview.push({ply:index,cp,san:moves[index-1].san,label,fen:positions[index-1],playedUci:moves[index-1].from+moves[index-1].to+(moves[index-1].promotion||''),bestUci:bestByPosition[index-1]||null});
   }
   bestByPosition[index]=bestMove;previousScore=cp;index++;renderReview();next();
  }
 }};
 worker.postMessage('uci');
}
function renderReview(){
 const canvas=$('review-chart');if(!canvas)return;const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#0d1b24';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#41545b';ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();
 const points=[{ply:0,cp:0},...(state.fullReview.length?state.fullReview:state.review)].sort((a,b)=>a.ply-b.ply);
 if(points.length>1){const max=Math.max(1,...points.map(x=>x.ply));ctx.beginPath();points.forEach((p,i)=>{const x=p.ply/max*(w-20)+10,y=h/2-Math.tanh(p.cp/400)*(h*.43);if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.strokeStyle='#60e5aa';ctx.lineWidth=3;ctx.stroke()}
 $('review-summary').textContent=state.reviewBusy?'Analisando cada posição da partida… '+state.fullReview.length+' posições concluídas.':state.fullReview.length?state.fullReview.length+' posições analisadas. Classificação estimada por variação de avaliação.':state.review.length?state.review.length+' posições avaliadas durante o jogo (amostras, não revisão completa).':'Jogue para registrar avaliações.';
 $('review-list').innerHTML=state.reviewOpen?(state.fullReview.length?state.fullReview:state.review).sort((a,b)=>a.ply-b.ply).map(x=>'<div class="review-entry"><span>'+x.ply+'. '+x.san+' '+(x.label||'')+'</span><strong>'+(x.cp/100).toFixed(2)+'</strong></div>').join('')||'<p class="muted">Sem avaliações ainda.</p>':'';
}
function resetCoach(){state.coachLevel=0;state.coachRevealed=false}
function schedule(){clearTimeout(state.timer);state.timer=setTimeout(analyze,250)}
function scoreText(info){if(info.mate!==undefined)return `M${info.mate}`;return ((info.cp||0)/100).toFixed(2)}
function toSanLine(uci){const clone=new Chess(game.fen());const out=[];for(const str of uci.slice(0,8)){try{const m=clone.move({from:str.slice(0,2),to:str.slice(2,4),promotion:str[4]||'q'});if(!m)break;out.push(m.san)}catch{break}}return out.join(' ')}
function renderArrows(){
  const svg=$('arrows');if(!svg)return;
  const lines=state.liveSuggestions&&state.arrows&&state.bestVisible?state.analysis.filter(Boolean).slice(0,3):[];
  const order=squares();const colors=['#25df8d','#68c5ff','#f5bf60'];
  const coords=sq=>{const n=order.indexOf(sq);return n<0?null:{x:(n%8)*100+50,y:Math.floor(n/8)*100+50}};
  svg.innerHTML='<defs>'+colors.map((c,i)=>'<marker id="arrow'+i+'" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="'+c+'"/></marker>').join('')+'</defs>'+lines.map((a,i)=>{const from=coords(a.uci.slice(0,2)),to=coords(a.uci.slice(2,4));if(!from||!to)return '';const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1;return '<line x1="'+(from.x+dx/len*12)+'" y1="'+(from.y+dy/len*12)+'" x2="'+(to.x-dx/len*23)+'" y2="'+(to.y-dy/len*23)+'" stroke="'+colors[i]+'" stroke-width="'+(i===0?13:8)+'" stroke-linecap="round" opacity="'+(i===0?.9:.72)+'" marker-end="url(#arrow'+i+')"/>'}).join('');
}
function renderCoach(){
  const top=state.analysis[0],box=$('coach-detail');
  if(!top){$('coach').textContent='Aguardando análise da posição…';box.textContent='O motor está calculando.';return}
  const move=toSanLine(top.pv.slice(0,1)),clone=new Chess(game.fen());
  let detail='';try{const m=clone.move({from:top.uci.slice(0,2),to:top.uci.slice(2,4),promotion:top.uci[4]||'q'});if(m){const hints=[];if(m.san.includes('+'))hints.push('O lance dá xeque ao rei adversário.');if(m.captured)hints.push('Existe uma captura disponível.');if(m.piece==='p')hints.push('Observe a estrutura de peões e o controle do centro.');if(['n','b'].includes(m.piece))hints.push('Considere o desenvolvimento e a atividade das peças.');if(m.flags.includes('k')||m.flags.includes('q'))hints.push('A segurança do rei é importante nesta posição.');detail=hints.join(' ')||'Compare as peças atacadas, casas controladas e a segurança dos reis.'}}catch{}
  $('coach').textContent=state.coachRevealed?'Melhor lance calculado: '+move+'.':'Encontre o melhor lance antes de revelar a resposta.';
  if(state.coachRevealed)box.textContent='★ '+move+' ('+top.uci.slice(0,2)+' → '+top.uci.slice(2,4)+'). '+detail;
  else if(state.coachLevel===0)box.textContent='Tente identificar ameaças e oportunidades antes de pedir uma pista.';
  else if(state.coachLevel===1)box.textContent='Pista 1: '+detail;
  else if(state.coachLevel===2)box.textContent='Pista 2: examine a peça na casa '+top.uci.slice(0,2)+'. '+detail;
  else box.textContent='Pista 3: essa peça pode ir para '+top.uci.slice(2,4)+'. Qual é a ideia?';
}
function updateAnalysis(){const items=state.analysis.filter(Boolean);$('variations').innerHTML=items.length?items.map((a,i)=>`<div class="variation"><span class="number">#${i+1}</span><div><strong>${scoreText(a)}</strong><p>${toSanLine(a.pv)}</p></div><span class="depth">d${a.depth}</span></div>`).join(''):'<p class="muted">Calculando variantes...</p>';const top=items[0];$('best-move').textContent=top?.uci&&state.bestVisible&&state.liveSuggestions?`★ Melhor lance: ${toSanLine(top.pv.slice(0,1))} (${top.uci.slice(0,2)} → ${top.uci.slice(2,4)})`:'Melhor lance: '+(state.bestVisible&&state.liveSuggestions?'calculando…':'oculto');renderArrows();renderCoach();if(!top)return;const cp=top.mate!==undefined?(top.mate>0?1500:-1500):(top.cp||0);const whiteCp=cp*(game.turn()==='w'?1:-1);$('eval-text').textContent=top.mate!==undefined?`Mate ${Math.abs(top.mate)}`:(whiteCp/100).toFixed(2);$('eval-desc').textContent=whiteCp>50?'Vantagem das brancas':whiteCp< -50?'Vantagem das pretas':'Posição aproximadamente equilibrada';const pct=Math.max(5,Math.min(95,50+50*Math.tanh(whiteCp/450)));$('meter-white').style.width=pct+'%';renderCoach()}
function parseInfo(line){if(!line.startsWith('info ')||!line.includes(' pv ')||!line.includes(' score '))return;const d=Number(line.match(/\bdepth (\d+)/)?.[1]||0),multi=Number(line.match(/\bmultipv (\d+)/)?.[1]||1),cp=line.match(/\bscore cp (-?\d+)/),mate=line.match(/\bscore mate (-?\d+)/),pv=line.split(' pv ')[1]?.trim().split(/\s+/)||[];if(multi>state.lines||(!cp&&!mate)||!pv.length)return;const prior=state.analysis[multi-1];if(prior&&d<prior.depth)return;state.analysis[multi-1]={depth:d,cp:cp?Number(cp[1]):undefined,mate:mate?Number(mate[1]):undefined,pv,uci:pv[0]};if(multi===1)recordEval();updateAnalysis();if(multi===1&&state.coachRevealed)draw()}
function analyze(){
  restartLiveAnalysis();
  state.analysis=[];state.score=null;state.thinking=false;state.searchFen=null;updateAnalysis();draw();
  if(!state.ready){$('coach').textContent='Aguardando o Stockfish iniciar.';return}
  state.engine.postMessage('stop');
  if(game.isGameOver()){$('coach').textContent='Partida encerrada.';return}
  // Wait for the previous search to stop before starting another one.
  state.pendingSearch=true;
  state.engine.postMessage('isready');
  $('engine-state').textContent='● Preparando análise';
}
function startSearch(){
  if(!state.pendingSearch||!state.ready)return;
  state.pendingSearch=false;
  const isBlack=state.mode==='play'&&game.turn()!==state.human;
  if(state.liveEnabled&&!isBlack){state.thinking=false;state.searchFen=null;$('engine-state').textContent='● Análise contínua';return}
  state.thinking=isBlack;
  state.searchFen=game.fen();
  state.engine.postMessage('setoption name Skill Level value '+state.skill);state.engine.postMessage('setoption name MultiPV value '+(isBlack?1:state.lines));
  state.engine.postMessage('position fen '+state.searchFen);
  state.engine.postMessage('go depth '+(isBlack?Math.min(state.depth,12):state.depth));
  $('engine-state').textContent=isBlack?'● Stockfish jogando…':'● Analisando';
  $('status').textContent=isBlack?'Stockfish pensando nas pretas':'Motor pronto';
}
function stopLiveAnalysis(){
 if(state.liveWorker){state.liveWorker.terminate();state.liveWorker=null}
 state.liveFen=null;state.liveReady=false;
}
function restartLiveAnalysis(){
 stopLiveAnalysis();
 if(!state.liveEnabled||!state.ready||!state.engineScript||game.isGameOver()){
  $('live-status').textContent=state.liveEnabled?'● Aguardando motor':'● Desligada';return
 }
 const fen=game.fen(),worker=new Worker('/engine/'+state.engineScript);
 state.liveWorker=worker;state.liveFen=fen;
 $('live-status').textContent='● Iniciando análise';
 worker.onerror=()=>{if(state.liveWorker!==worker)return;stopLiveAnalysis();$('live-status').textContent='● Falha no motor'};
 worker.onmessage=e=>{
  if(state.liveWorker!==worker||state.liveFen!==game.fen())return;
  for(const line of String(e.data).split(/\r?\n/)){
   if(line==='uciok'){worker.postMessage('setoption name MultiPV value '+state.lines);worker.postMessage('setoption name Skill Level value 20');worker.postMessage('isready')}
   else if(line==='readyok'&&!state.liveReady){state.liveReady=true;worker.postMessage('position fen '+fen);worker.postMessage('go depth '+Math.max(state.liveDepth,state.depth));$('live-status').textContent='● Analisando posição'}
   else if(line.startsWith('info ')){parseInfo(line);$('live-status').textContent='● Análise atualizada'}
   else if(line.startsWith('bestmove ')){$('live-status').textContent='● Posição analisada'}
  }
 };
 worker.postMessage('uci');
}
$('live-toggle').onchange=e=>{state.liveEnabled=e.target.checked;if(!state.liveEnabled){stopLiveAnalysis();$('live-status').textContent='● Desligada'}analyze()};
$('suggest-toggle').onchange=e=>{state.liveSuggestions=e.target.checked;updateAnalysis();draw()};
async function init(){try{const res=await fetch('/engine/manifest.json');if(!res.ok)throw Error('Motor não preparado');const {script}=await res.json();state.engineScript=script;state.engine=new Worker('/engine/'+script);state.engine.onmessage=e=>{const lines=String(e.data).split(/\r?\n/);for(const l of lines){if(l.includes('uciok'))state.engine.postMessage('isready');if(l.includes('readyok')){if(!state.ready){state.ready=true;$('status').textContent='Motor pronto';$('engine-state').textContent='● Online';analyze()}else startSearch()}else if(l.startsWith('info ')){if(!state.liveEnabled&&state.searchFen===game.fen()&&!state.pendingSearch)parseInfo(l)}else if(l.startsWith('bestmove ')){ $('engine-state').textContent='● Análise concluída'; if(state.thinking&&state.searchFen===game.fen()&&!state.pendingSearch&&state.mode==='play'&&game.turn()!==state.human&&!game.isGameOver()){state.thinking=false;const u=l.split(' ')[1];try{game.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]||'q'});state.clockLast=Date.now();draw();setTimeout(analyze,80)}catch(err){console.error(err)}} }}};state.engine.onerror=()=>{$('status').textContent='Erro ao carregar Stockfish';$('engine-state').textContent='● Erro';toast('Verifique os arquivos do motor')};state.engine.postMessage('uci')}catch(e){$('status').textContent='Motor não instalado';$('engine-state').textContent='● Offline';$('coach').textContent='Execute npm install e npm run prepare-engine para habilitar o Stockfish.';console.error(e)}}
resetMatch();renderProgress();renderTraining();draw();init();
