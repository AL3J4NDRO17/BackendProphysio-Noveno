const { Testimonial, User } = require("../config/index");

// Obtener todos los testimonios
const getAllTestimonios = async (req, res) => {


    try {
        const testimonios = await Testimonial.findAll({
            include: [
                { model: User, as: "usuario", attributes: ["id_usuario", "nombre", "email"] },
            ],
        });

        res.json(testimonios);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al obtener los testimonios." });
    }
};

// Obtener un testimonio por ID de usuario
const getTestimonioByUserId = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const testimonio = await Testimonial.findOne({
            where: { id_usuario },
            include: [{ model: User, as: "usuario", attributes: ["id_usuario", "nombre"] }],
        });

        if (!testimonio) return res.status(404).json({ error: "Testimonio no encontrado." });

        res.json(testimonio);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el testimonio." });
    }
};

// Crear un testimonio (solo si el usuario no tiene uno)
const createTestimonio = async (req, res) => {
    try {
        const { id_usuario, nombre_usuario, puntaje, comentarios, creado_por_admin } = req.body;

        // Validar que si el testimonio es de un usuario, ese usuario exista
        if (id_usuario) {
            const usuario = await Usuario.findByPk(id_usuario);
            if (!usuario) return res.status(404).json({ error: "El usuario no existe." });
        }

        const nuevoTestimonio = await Testimonial.create({
            id_usuario: id_usuario || null, // Puede ser NULL si lo crea un admin
            nombre_usuario: nombre_usuario || (id_usuario ? usuario.nombre : "Anónimo"),
            puntaje,
            comentarios,
            aprobado: creado_por_admin ? true : false, // Si lo crea un admin, lo aprueba automáticamente
            creado_por_admin: creado_por_admin || false,
        });

        res.status(201).json(nuevoTestimonio);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el testimonio." });
    }
};


// Actualizar un testimonio
const updateTestimonio = async (req, res) => {
    try {
        const { id } = req.params;

        const { nombre_usuario,aprobado, puntaje, comentarios } = req.body;
        console.log(req.params, req.body, id)
        const testimonio = await Testimonial.findByPk(id);
        if (!testimonio) {
            return res.status(404).json({ error: "Testimonio no encontrado." });
        }

        // Actualizar solo los campos enviados en la solicitud
        if (nombre_usuario !== undefined) testimonio.nombre_usuario = nombre_usufario;
        if (comentarios !== undefined) testimonio.comentarios = comentarios;
        if (puntaje !== undefined) testimonio.puntaje = puntaje;
        if (aprobado !== undefined) testimonio.aprobado = aprobado;

        await testimonio.save();

        res.json({
            message: "Testimonio actualizado correctamente.",
            testimonio,
        });
    } catch (error) {
        console.error("❌ Error al actualizar testimonio:", error);
        res.status(500).json({ error: "Error al actualizar el testimonio." });
    }
};

// Eliminar un testimonio
const deleteTestimonio = async (req, res) => {
    try {
        
        const { id } = req.params;
      
        const testimonio = await Testimonial.findOne({ where: { id_testimonio:id } });

        if (!testimonio) return res.status(404).json({ error: "Testimonio no encontrado." });

        await testimonio.destroy();
        res.json({ message: "Testimonio eliminado correctamente." });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al eliminar el testimonio." });
    }
};

const updateTestimonioStatus = async (req, res) => {
    try {

        const { id } = req.params; // ID del testimonio que se actualizará
        const { status } = req.body; // Nuevo estado (true o false)

        // Verificar si el testimonio existe
        const testimonio = await Testimonial.findByPk(id);
        if (!testimonio) {
            return res.status(404).json({ error: "Testimonio no encontrado." });
        }

        // Actualizar el estado de aprobación
        testimonio.aprobado = status;
        await testimonio.save();

        res.json({
            message: "Estado del testimonio actualizado correctamente.",
            testimonio,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error al actualizar el estado del testimonio." });
    }
};
module.exports = {
    getAllTestimonios,
    getTestimonioByUserId,
    createTestimonio,
    updateTestimonio,
    deleteTestimonio,
    updateTestimonioStatus
};
