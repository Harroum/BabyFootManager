## --------------[+] Prérequis [+]-------------- 

	- Node.js (https://nodejs.org/)
	- PostgreSQL (https://www.postgresql.org/)

## --------------[+] Installation [+]-------------- 

### 1. Cloner le dépôt : 

	git clone https://github.com/votre-utilisateur/babyfoot-manager.git
	cd babyfoot-manager

### 2. Installer les dépendances : 

	npm install

### 3. Configurer la base de données : 
	
	CREATE DATABASE babyfoot_manager;

	\c babyfoot_manager

	CREATE TABLE games (
	    id SERIAL PRIMARY KEY,
	    name VARCHAR(100) NOT NULL,
	    status VARCHAR(50) NOT NULL DEFAULT 'en cours',
	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

### 4. Configurer les variables d'environnement :

	DB_USER=votre postgres user
	DB_HOST=localhost
	DB_DATABASE=babyfoot_manager
	DB_PASSWORD= le mot de pass de votre postgres user
	DB_PORT=5432
	PORT=3000

### 5. Lancer le serveur  :

	node server.js