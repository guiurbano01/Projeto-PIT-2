function verificarAutenticacao(req, res, next) {
    if (req.session.userId) {
        return next(); // O usuário está autenticado
    } else {
        return res.status(401).json({ message: "Usuário não autenticado" }); // Não autenticado
    }
}

module.exports = verificarAutenticacao;
