//Importacion del framework para crear apis
const express = require('express');

//Crear una nueva instancia para las rutas
const router = express.Router();

//Utilidades para subir archivos
const { upload, cloudinary } = require('../utils/upload/fileUpload');  // Asegúrate de tener la configuración de multer aquí

/* Controladores de la API 
    createBlog: Función para crear un nuevo blog
    getBlogs: Función para obtener todos los blogs
    updateBlog: Función para actualizar un blog
    deleteBlog: Función para eliminar un blog
    updateBlogStatus: Función para actualizar el estado de un blog
    getBlogById: Función para obtener un blog por ID
*/
const { createBlog, getBlogs, updateBlog, deleteBlog, updateBlogStatus, getBlogById } = require('../controllers/blogController');



//Endpoints de la API
router.post('/create', upload.array('images', 5), createBlog); // ✅ Solo admin puede crear
router.get("/getBlogById/:id", getBlogById)
router.put('/update/:id', updateBlog); 
router.delete('/delete/:id', deleteBlog);
router.put("/updateStatus/:id", updateBlogStatus);
router.get('/list', getBlogs);


// Ruta para cargar imagen con Cloudinary
router.post("/upload-image", upload.single("file"), async (req, res) => {
    try {
        // Subir a Cloudinary y convertir la imagen a WebP
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "blog-images",  // Puedes personalizar la carpeta
            transformation: [
                { width: 800, height: 800, crop: "limit" },  // Ajusta el tamaño
                { quality: "auto" },  // Optimizamos la calidad
                { fetch_format: "webp" }  // Convertimos a WebP
            ]
        });

        // Responder con la URL de la imagen cargada
        res.json({ secure_url: result.secure_url });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Error uploading image" });
    }
});

module.exports = router;
