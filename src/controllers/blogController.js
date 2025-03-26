// Importar el modelo de Blog
const { Blog } = require('../config/index'); 


// Obtener todos los blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll();
    res.json(blogs);
  } catch (error) {
    console.error("Error al obtener blogs:", error);
    res.status(500).json({ message: "Error al obtener los blogs." });
  }
};

// Crear un nuevo blog
exports.createBlog = async (req, res) => {
  console.log(req.body); // 🔍 Verifica cómo llegan los datos

  try {
    const {
      title,
      mainContent,
      effectsTitle,
      effectsContent,
      author,
      categoryId,
      bannerTitle,
      textStyle,
      status,
      contentImageSize,
      bannerImage,
      contentImage
    } = req.body;

    // 🔥 **Corrección clave: Convertir `contentImageSize` si es un string JSON**
    let finalContentImageSize = contentImageSize;
    if (typeof contentImageSize === "string") {
      try {
        finalContentImageSize = JSON.parse(contentImageSize); // Convertimos el string en objeto
      } catch (error) {
        console.error("Error al parsear contentImageSize:", error);
        return res.status(400).json({ message: "Formato inválido de contentImageSize" });
      }
    }

    // Asegurar que `bannerImage` y `contentImage` existen
    if (!bannerImage || !contentImage || !finalContentImageSize) {
      return res.status(400).json({ message: "Las imágenes y sus tamaños son obligatorios" });
    }

    // Crear el nuevo blog en la base de datos
    const newBlog = await Blog.create({
      title,
      mainContent,
      effectsTitle,
      effectsContent,
      author,
      categoryId,
      bannerTitle,
      bannerImage,
      contentImage,
      contentimagedimensions: finalContentImageSize, // Ahora sí es un objeto
      textStyle: JSON.parse(textStyle),
      status: status || "draft",
    });

    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Error al crear blog:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

//Actualizar un blog existente
exports.updateBlog = async (req, res) => {
  console.log(req.body)
  try {
    const { id } = req.params;
    const { title, mainContent, effectsTitle, effectsContent, author, categoryId, bannerTitle, textStyle, status, contentImageSize, bannerImage,
      contentImage } = req.body;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog no encontrado" });
    }

    // Actualizar los datos del blog
    blog.title = title;
    blog.mainContent = mainContent;
    blog.effectsTitle = effectsTitle;
    blog.effectsContent = effectsContent;
    blog.author = author;
    blog.categoryId = categoryId;
    blog.bannerTitle = bannerTitle;
    blog.textStyle = textStyle;
    blog.status = status;

    if (bannerImage) {
      blog.bannerImage = bannerImage; // Guardar nueva imagen si la hay
    }
    if (contentImage) {
      blog.contentImage = contentImage; // Guardar nueva imagen si la hay
    }
    if (contentImageSize) {
      blog.contentimagedimensions = contentImageSize; // Guardar las nuevas dimensiones
    }

    await blog.save(); // Guardar los cambios en la base de datos

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error al actualizar el blog:", error);
    res.status(500).json({ message: "Error al actualizar el blog." });
  }
};

// Eliminar un blog
exports.deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog no encontrado" });
    }

    await blog.destroy();
    res.json({ message: "Blog eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el blog:", error);
    res.status(500).json({ message: "Error al eliminar el blog." });
  }
};

// Actualizar el estado de un blog (de Draft a Published o viceversa)
exports.updateBlogStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // El nuevo estado, que debe ser "draft" o "published"

  try {
    // Verificar si el estado es válido
    if (status !== "draft" && status !== "published") {
      return res.status(400).json({ message: "Estado inválido. Debe ser 'draft' o 'published'." });
    }

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog no encontrado" });
    }

    // Actualizar el estado
    await blog.update({ status });

    res.json({ message: `Estado del blog actualizado a ${status}.`, blog });
  } catch (error) {
    console.error("Error al actualizar el estado del blog:", error);
    res.status(500).json({ message: "Error al actualizar el estado del blog." });
  }
};

// Obtener un blog por su ID
exports.getBlogById = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findByPk(id);  // Busca el blog por su ID

    if (!blog) {
      return res.status(404).json({ message: "Blog no encontrado" });  // Si no lo encuentra, devuelve un error
    }

    res.status(200).json(blog);  // Si lo encuentra, devuelve el blog
  } catch (error) {
    console.error("Error al obtener el blog:", error);
    res.status(500).json({ message: "Error al obtener el blog." });  // Manejo de errores
  }
};


