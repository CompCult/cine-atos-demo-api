const express = require('express');
const router = express.Router();
const awaitHandler = require('../middlewares/awaitHandler');

const userController = require('../controllers/user')

/**
 * @api {get} /users 01. Listar usuários
 * @apiGroup Users
 * 
 * @apiDescription
 * Lista todos os usuários cadastrados na aplicação.
 * 
 * @apiExample {curl} Exemplo de uso
 * curl http://127.0.0.1:3000/users
 */
router.get('/', awaitHandler(userController.listUsers));

/**
 * @api {get} /users/:user_id  02. Recuperar usuário pelo id
 * @apiGroup Users
 * 
 * @apiDescription
 * Recupera um usuário através do Id.
 * 
 * @apiExample {curl} Exemplo de uso
 * curl http://127.0.0.1:3000/users/10
 */
router.get('/:user_id', userController.findUserById);

/**
 * @api {get} /users/query/fields 03. Recuperar usuário por parâmetros
 * @apiGroup Users
 * 
 * @apiDescription
 * Recupera os usuários com base nos parâmetros passados.
 * 
 * @apiExample {curl} Exemplo de uso
 * curl http://127.0.0.1:3000/users/query/fields?institution="UFCG"
 */
router.get('/query/fields', userController.listUsers);

/**
 * @api {post} /users/register 04. Criar usuário
 * @apiGroup Users
 * 
 * @apiDescription
 * Cria um novo usuário.
 */
router.post('/register', awaitHandler(userController.createUser));

/**
 * @api {post} /users/account-verification 04. Criar usuário
 * @apiGroup Users
 * 
 * @apiDescription
 * Altera o status de ativação da conta para true.
 */
router.put('/account-verification', awaitHandler(userController.verifyAccount));

/**
 * @api {post} /users/recovery/password_edit 10. Aplicar nova senha
 * @apiGroup Users
 * 
 * @apiDescription
 * Atualiza a nova senha do usuário após a confirmação via email.
 * Lembre-se de usar o /recovery antes.
 */
router.post('/recovery/password_edit', userController.updatePassword);

/**
 * @api {post} /users/recovery 09. Alterar senha
 * @apiGroup Users
 * 
 * @apiDescription
 * Armazena nova senha do usuário e envia email para confirmação.
 */
router.post('/recovery', userController.recoveryPassword);

/**
 * @api {post} /users/update/:user_id 06. Atualizar usuário (POST)
 * @apiGroup Users
 * 
 * @apiDescription
 * Atualiza os dados de um usuário via POST.
 */
router.post('/update/:user_id', userController.updateUser);

/**
 * @api {put} /users/:user_id 05. Atualizar usuário
 * @apiGroup Users
 * 
 * @apiDescription
 * Atualiza os dados de um usuário.
 */
router.put('/:user_id', userController.updateUser);

/**
 * @api {post} /users/auth 08. Autenticar usuário
 * @apiGroup Users
 * 
 * @apiDescription
 * Autentica um usuário.
 */
router.post('/auth', userController.authenticate);

/**
 * @api {delete} /users/:user_id 07. Remover usuário
 * @apiGroup Users
 * 
 * @apiDescription
 * Exclui um usuário.
 */
router.delete('/:user_id', userController.deleteUser); 

module.exports = router;
