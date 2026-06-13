# 📌 Mural de Recados Coletivo (Docker & Node.js)
Este é um projeto acadêmico de um **Mural de Recados Dinâmico e Interativo**, construído com o intuito de demonstrar o uso de **Containerização, Balanceamento de Carga e Persistência de Dados** utilizando o ecossistema Docker.
## Funcionalidades
* **CRUD Completo:** Crie, leia, edite e apague post-its em tempo real.
* **UI Premium:** Design moderno com fontes profissionais (Google Fonts) e micro-animações.
* **Single Page Feel:** Operações de edição e remoção ocorrem em background (usando a *Fetch API*), sem a necessidade de recarregar a tela inteira a cada clique.
* **Escalabilidade Visível:** A aplicação mostra dinamicamente qual container (Host ID) está renderizando a página para você, provando o funcionamento do *Load Balancer*.
## 🛠️ Arquitetura e Tecnologias
* **Backend:** Node.js + Express
* **Frontend:** HTML5, CSS3, JavaScript puro
* **Banco de Dados:** Redis (Para armazenamento em memória super rápido)
* **Servidor Web / Proxy:** Nginx
* **Orquestração:** Docker e Docker Compose
O projeto sobe **4 containers simultâneos** em uma rede virtual própria:
1. `gateway` (Nginx): Recebe o acesso na porta 80 e balanceia a carga (Round-Robin).
2. `app1` (Node.js): Primeira instância do aplicativo.
3. `app2` (Node.js): Segunda instância do aplicativo.
4. `db` (Redis): Banco de dados centralizado.
---
## 🚀 Como Executar o Projeto (A partir do Código Fonte)
Se você baixou este repositório completo e quer compilar a imagem na sua própria máquina:
1. Certifique-se de ter o [Docker Desktop](https://www.docker.com/products/docker-desktop/) rodando no seu computador.
2. Abra o terminal na pasta raiz do projeto.
3. Execute o comando mágico:
   ```bash
   docker-compose up --build -d
   ```
4. Acesse `http://localhost` no seu navegador.
---
## ☁️ Como Rodar a Aplicação Sem o Código Fonte (Baixando do Docker Hub)
Se você quer apenas **executar a aplicação** em um computador novo (por exemplo, no notebook de uma apresentação) de forma super rápida e sem precisar baixar o repositório inteiro, você pode puxar a imagem pronta diretamente do Docker Hub!
**Você precisará de apenas dois arquivos na mesma pasta:**
* `docker-compose.yml`
* `nginx.conf`
### ⚠️ Passo a Passo (Atenção à mudança no arquivo)
1. No arquivo `docker-compose.yml`, procure a configuração dos serviços `app1` e `app2`.
2. **Apague** a instrução `build: .` e **adicione** a instrução `image:`, apontando para o seu repositório no Docker Hub. 
O arquivo ficará assim:
```yaml
  app1:
    image: iiimathszl/mural-docker:latest
    depends_on:
      - db
  app2:
    image: iiimathszl/mural-docker:latest
    depends_on:
      - db
```
3. Com os dois arquivos salvos na sua pasta, abra o terminal e rode:
   ```bash
   # Faz o download da imagem mais recente
   docker pull iiimathszl/mural-docker:latest
   
   # Sobe a infraestrutura completa lendo as imagens baixadas
   docker-compose up -d
   ```
Apenas com isso, o Docker vai baixar o Nginx, baixar o Redis, baixar o Mural via Docker Hub e integrar os três em questão de segundos!
---
## 🧹 Comandos Extras Úteis
* Ver se os containers estão rodando:
  ```bash
  docker-compose ps
  ```
* Ver todos os logs da aplicação:
  ```bash
  docker-compose logs -f
  ```
* **Apagar o banco de dados inteiro (FLUSHALL):**
  ```bash
  docker-compose exec db redis-cli FLUSHALL
  ```
* Desligar a aplicação e liberar a porta do computador:
  ```bash
  docker-compose down
  ```
---
*Projeto desenvolvido por Matheus Felipe Dias da Silva e Inácio Ribeiro Azevedo.*
