const express = require('express');
const redis = require('redis');
const os = require('os');

const app = express();
app.use(express.urlencoded({ extended: true })); // Permite ler os dados do formulário
app.use(express.json());

const client = redis.createClient({ url: 'redis://db:6379' });
client.on('error', err => console.log('Erro no Redis:', err));

(async () => { await client.connect(); })();

app.get('/', async (req, res) => {
    // Busca todos os post-its salvos no banco Redis
    const dadosOgitais = await client.lRange('mural_recados', 0, -1) || [];
    const recados = dadosOgitais.map(item => JSON.parse(item));
    const idContainer = os.hostname();

    // Transforma os dados em blocos visuais de Post-it
    const htmlRecados = recados.map(r => {
        // Gera uma rotação leve aleatória para parecer um mural real
        const angulo = Math.floor(Math.random() * 6) - 3; 
        const currentId = r.id || Date.now() + Math.random(); 

        return `
            <div class="post-it" style="background-color: ${r.cor}; transform: rotate(${angulo}deg);">
                <div class="post-it-actions">
                    <button onclick="editarRecado('${currentId}', \`${r.texto.replace(/`/g, '\\`')}\`)" title="Editar" class="btn-icon text-blue"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="apagarRecado('${currentId}')" title="Apagar" class="btn-icon text-red"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <p class="post-it-text">${r.texto}</p>
                <small class="post-it-footer">id: ${r.respondidoPor}</small>
            </div>
        `;
    }).join('');

    // Página HTML completa e estilizada
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mural Dinâmico Docker</title>
            
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Kalam:wght@400;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            
            <style>
                * { box-sizing: border-box; }
                body {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    font-family: 'Inter', sans-serif;
                    margin: 0; padding: 40px 20px;
                    min-height: 100vh;
                    color: #2c3e50;
                }
                .container { max-width: 1100px; margin: 0 auto; text-align: center; }
                
                h1 { font-weight: 800; font-size: 2.8rem; margin-bottom: 10px; color: #1a252f; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
                .server-badge {
                    background: #34495e; color: #fff; padding: 4px 10px; 
                    border-radius: 6px; font-family: monospace; font-size: 1rem;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    padding: 30px; border-radius: 16px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
                    display: inline-block; text-align: left; margin: 30px auto;
                    position: relative; width: 100%; max-width: 600px;
                }
                textarea {
                    width: 100%; height: 90px; padding: 15px; border-radius: 10px;
                    border: 1px solid #dcdde1; resize: none; font-family: 'Inter', sans-serif;
                    font-size: 1rem; outline: none; transition: all 0.3s ease; box-sizing: border-box;
                }
                textarea:focus { border-color: #3498db; box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2); }
                
                .controls { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
                select { padding: 10px; border-radius: 8px; border: 1px solid #dcdde1; outline: none; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; }
                
                .btn {
                    border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease; font-size: 1rem; display: inline-flex; align-items: center; gap: 8px;
                }
                .btn-add { background: #2ecc71; color: white; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3); }
                .btn-add:hover { background: #27ae60; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4); }
                .btn-danger { background: #e74c3c; color: white; margin-left: 10px; }
                .btn-danger:hover { background: #c0392b; }

                .board {
                    display: flex; flex-wrap: wrap; justify-content: center; gap: 25px;
                    background: rgba(0, 0, 0, 0.03); border: 2px dashed rgba(0,0,0,0.1);
                    padding: 40px; border-radius: 20px; min-height: 400px; position: relative;
                }
                .empty-msg { color: #95a5a6; font-size: 1.2rem; margin-top: 150px; font-weight: 600; }

                .post-it {
                    width: 220px; min-height: 220px; padding: 25px 20px 20px 20px;
                    box-shadow: 3px 5px 15px rgba(0,0,0,0.1);
                    border-bottom-right-radius: 30px 5px;
                    display: flex; flex-direction: column; justify-content: space-between;
                    position: relative; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    cursor: default;
                }
                .post-it:hover {
                    transform: scale(1.05) rotate(0deg) !important;
                    box-shadow: 8px 12px 25px rgba(0,0,0,0.2);
                    z-index: 10;
                }
                
                .post-it-text { font-family: 'Kalam', cursive; font-size: 1.4rem; margin: 0; line-height: 1.3; color: #2c3e50; word-wrap: break-word; }
                .post-it-footer { color: rgba(0,0,0,0.5); text-align: right; font-size: 0.85rem; font-weight: 600; font-family: monospace; }
                
                .post-it-actions {
                    position: absolute; top: 8px; right: 8px; opacity: 0;
                    transition: opacity 0.2s ease; display: flex; gap: 5px;
                }
                .post-it:hover .post-it-actions { opacity: 1; }
                .btn-icon {
                    background: rgba(255,255,255,0.6); border: none; width: 28px; height: 28px; 
                    border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s ease;
                }
                .btn-icon:hover { background: white; transform: scale(1.1); box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
                .text-red { color: #e74c3c; }
                .text-blue { color: #3498db; }

            </style>
        </head>
        <body>
            <div class="container">
                <h1>Mural de Recados</h1>
                <p style="color: #7f8c8d; font-size: 1.1rem;">Renderizado por: <strong class="server-badge">${idContainer}</strong></p>

                <div class="glass-panel">
                    <form action="/adicionar" method="POST">
                        <textarea name="texto" placeholder="Escreva seu recado aqui..." required></textarea>
                        <div class="controls" style="gap: 25px; justify-content: flex-start;">
                            <div>
                                <select name="cor">
                                    <option value="#fff740">Amarelo</option>
                                    <option value="#ff7eb9">Rosa</option>
                                    <option value="#7afcff">Azul</option>
                                    <option value="#98ff98">Verde</option>
                                </select>
                            </div>
                            <div style="margin-left: auto;">
                                <button type="submit" class="btn btn-add"><i class="fa-solid fa-thumbtack"></i> Fixar</button>
                            </div>
                        </div>
                    </form>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px; max-width: 1100px; width: 100%; margin-left: auto; margin-right: auto; padding: 0 10px;">
                    <h2 style="margin: 0; font-size: 1.4rem; color: #34495e;">Recados Salvos</h2>
                    <button type="button" class="btn btn-danger" onclick="apagarTudo()"><i class="fa-solid fa-trash-can"></i> Limpar Mural</button>
                </div>

                <div class="board">
                    ${htmlRecados || '<p class="empty-msg"> O mural está vazio. Que tal adicionar um novo recado?</p>'}
                </div>
            </div>

            <script>
                async function apagarRecado(id) {
                    if(confirm('Apagar este recado?')) {
                        await fetch('/apagar/' + id, { method: 'POST' });
                        window.location.reload();
                    }
                }

                async function editarRecado(id, textoAtual) {
                    const novoTexto = prompt('Edite seu recado:', textoAtual);
                    if(novoTexto && novoTexto.trim() !== '' && novoTexto !== textoAtual) {
                        await fetch('/editar/' + id, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ texto: novoTexto })
                        });
                        window.location.reload();
                    }
                }

                async function apagarTudo() {
                    if(confirm('Deseja realmente jogar todos os recados no lixo?')) {
                        await fetch('/apagar-tudo', { method: 'POST' });
                        window.location.reload();
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/adicionar', async (req, res) => {
    const { texto, cor } = req.body;
    const idContainerAtual = os.hostname(); // Registra qual container salvou a nota

    if (texto) {
        // Salva o novo recado com um ID único
        const idUnico = Date.now().toString();
        const novoPostIt = JSON.stringify({ id: idUnico, texto, cor, respondidoPor: idContainerAtual });
        await client.lPush('mural_recados', novoPostIt);
    }
    res.redirect('/');
});

// Apaga o banco de dados inteiro, para apagar todos os recados
app.post('/apagar-tudo', async (req, res) => {
    await client.del('mural_recados');
    res.sendStatus(200);
});

// Remove apenas o recado com o ID recebido
app.post('/apagar/:id', async (req, res) => {
    const idParaApagar = req.params.id;
    const dadosOgitais = await client.lRange('mural_recados', 0, -1) || [];
    
    const recadosFiltrados = dadosOgitais.map(i => JSON.parse(i)).filter(r => r.id !== idParaApagar);
    
    await client.del('mural_recados');
    for (let i = recadosFiltrados.length - 1; i >= 0; i--) {
        await client.lPush('mural_recados', JSON.stringify(recadosFiltrados[i]));
    }
    res.sendStatus(200);
});

// Edita o texto do recado com o ID recebido
app.post('/editar/:id', async (req, res) => {
    const idParaEditar = req.params.id;
    const novoTexto = req.body.texto;
    
    const dadosOgitais = await client.lRange('mural_recados', 0, -1) || [];
    
    const recadosAtualizados = dadosOgitais.map(i => JSON.parse(i)).map(r => {
        if (r.id === idParaEditar) {
            r.texto = novoTexto;
        }
        return r;
    });

    await client.del('mural_recados');
    for (let i = recadosAtualizados.length - 1; i >= 0; i--) {
        await client.lPush('mural_recados', JSON.stringify(recadosAtualizados[i]));
    }
    res.sendStatus(200);
});

app.listen(3000);