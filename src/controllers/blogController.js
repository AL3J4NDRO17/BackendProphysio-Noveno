// Importar el modelo de Blog
const { Blog } = require("../config/index")
const { getPublicIdFromUrl, cloudinary } = require("../utils/upload/fileUpload"); // crea este helper

// Obtener todos los blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll()
    res.json(blogs)
  } catch (error) {
    console.error("Error al obtener blogs:", error)
    res.status(500).json({ message: "Error al obtener los blogs." })
  }
}

// Crear un nuevo blog
// exports.createBlog = async (req, res) => {
//   try {
//     const {
//       title,
//       mainContent,
//       effectsTitle,
//       effectsContent,
//       author,
//       categoryId,
//       bannerTitle,
//       textStyle,
//       status,
//       contentImageSize,
//       bannerImage,
//       contentImage,
//       attachedImages, // Añadido para imágenes adjuntas
//     } = req.body

//     // 🔄 Intentar parsear `contentImageSize` si llega como string
//     let finalContentImageSize = contentImageSize
//     if (typeof contentImageSize === "string") {
//       try {
//         finalContentImageSize = JSON.parse(contentImageSize)
//       } catch (error) {
//         console.error("Error al parsear contentImageSize:", error)
//         return res.status(400).json({ message: "Formato inválido de contentImageSize" })
//       }
//     }

//     // Validar bannerImage (obligatoria), contentImage puede no venir
//     if (!bannerImage) {
//       return res.status(400).json({ message: "La imagen de banner es obligatoria" })
//     }

//     // Crear objeto con datos del blog
//     const blogData = {
//       title,
//       mainContent,
//       effectsTitle,
//       effectsContent,
//       author,
//       categoryId,
//       bannerTitle,
//       bannerImage,
//       textStyle: JSON.parse(textStyle), // Nota: Asegúrate de que textStyle siempre sea un JSON string si se parsea aquí.
//       status: status || "draft",
//       attachedImages: attachedImages || [], // Guardar el array de imágenes adjuntas
//     }

//     // Si llega `contentImage`, se agrega
//     if (contentImage) {
//       blogData.contentImage = contentImage
//     }

//     // Si llega `finalContentImageSize`, se agrega
//     if (finalContentImageSize) {
//       blogData.contentimagedimensions = finalContentImageSize
//     }

//     // Crear el blog
//     const newBlog = await Blog.create(blogData)

//     res.status(201).json(newBlog)
//   } catch (error) {
//     console.error("Error al crear blog:", error)
//     res.status(500).json({ message: "Error en el servidor" })
//   }
// }

exports.createBlog = async (req, res) => {
  console.log("entre")
  console.log(req.body)
  console.log(req.files)

  try {
    const {
      title,
      mainContent,
      author,
      status,
      categoryId,
    } = req.body;

    const blogData = {
      title,
      mainContent,
      author,
      status: status || "draft",
      categoryId,
    };

    // Validar que venga la imagen de banner
    if (!req.files?.bannerImage || req.files.bannerImage.length === 0) {
      return res.status(400).json({ message: "La imagen de banner es obligatoria" });
    }

    // Ya viene subida, solo tomamos la URL
    blogData.bannerImage = req.files.bannerImage[0].path;

    // Si vienen imágenes adjuntas
    if (req.files?.attachedImages && req.files.attachedImages.length > 0) {
      const urls = req.files.attachedImages.map(file => file.path);
      blogData.attachedImages = urls;
    }

    // Crear blog
    const newBlog = await Blog.create(blogData);

    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Error al crear blog:", error);
    res.status(500).json({ message: "Error al crear el blog" });
  }
};

//Actualizar un blog existente
exports.updateBlog = async (req, res) => {
  try {
    console.log(req.params)
    console.log(req.body)
    const { id } = req.params;
    const {
      title,
      mainContent,
      author,
      bannerTitle,
      status,
      categoryId,
      bannerImageUrl, // Existing banner image URL
      attachedImageUrl, // Existing attached image URLs (array of strings)
      bannerImageRemoved, // Flag to remove banner image
      attachedImagesRemoved, // Flag to remove all attached images
    } = req.body

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog no encontrado" });
    }

    /// Update normal fields
    blog.title = title
    blog.mainContent = mainContent
    blog.author = author
    blog.bannerTitle = bannerTitle
    blog.status = status
    blog.categoryId = categoryId

    // Handle banner image update
    if (req.files?.bannerImage && req.files.bannerImage.length > 0) {
      // New banner image uploaded, delete old one if exists
      if (blog.bannerImage) {
        const publicId = getPublicIdFromUrl(blog.bannerImage)
        await cloudinary.uploader.destroy(publicId)
      }
      blog.bannerImage = req.files.bannerImage[0].path
    } else if (bannerImageRemoved === "true") {
      // Check for removal flag
      if (blog.bannerImage) {
        const publicId = getPublicIdFromUrl(blog.bannerImage)
        await cloudinary.uploader.destroy(publicId)
      }
      blog.bannerImage = null
    } else if (bannerImageUrl) {
      // Keep existing URL if no new file and not removed
      blog.bannerImage = bannerImageUrl
    } else if (!req.files?.bannerImage && !bannerImageRemoved && !bannerImageUrl && blog.bannerImage) {
      // If no new file, no removal flag, no existing URL sent, but there was an image, keep it.
      // This handles cases where the image was not touched.
    }

    // Handle attached images update
    let newAttachedImages = []
    if (req.files?.attachedImages && req.files.attachedImages.length > 0) {
      newAttachedImages = req.files.attachedImages.map((file) => file.path)
    }

    let existingAttachedImageUrls = []
    if (attachedImageUrl) {
      // attachedImageUrl can be a single string or an array of strings (if multiple existing images)
      existingAttachedImageUrls = Array.isArray(attachedImageUrl) ? attachedImageUrl : [attachedImageUrl]
    }

    if (attachedImagesRemoved === "true") {
      // If flag to remove all is set, delete all existing attached images
      if (blog.attachedImages && blog.attachedImages.length > 0) {
        for (const url of blog.attachedImages) {
          const publicId = getPublicIdFromUrl(url)
          await cloudinary.uploader.destroy(publicId)
        }
      }
      blog.attachedImages = newAttachedImages // Only new files will remain
    } else {
      // Combine existing and new images
      // First, identify images to remove (those in blog.attachedImages but not in existingAttachedImageUrls)
      const imagesToDelete = blog.attachedImages.filter((url) => !existingAttachedImageUrls.includes(url))
      for (const url of imagesToDelete) {
        const publicId = getPublicIdFromUrl(url)
        await cloudinary.uploader.destroy(publicId)
      }
      // Then, set blog.attachedImages to the combination of kept existing and new uploaded
      blog.attachedImages = [...existingAttachedImageUrls, ...newAttachedImages]
    }

    await blog.save()

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error al actualizar el blog:", error);
    res.status(500).json({ message: "Error al actualizar el blog" });
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

    // Borrar imagen de banner si existe
    if (blog.bannerImage) {
      const publicId = getPublicIdFromUrl(blog.bannerImage);
      await cloudinary.uploader.destroy(publicId);
    }

    // Borrar attachedImages si existen
    if (blog.attachedImages && blog.attachedImages.length > 0) {
      for (const url of blog.attachedImages) {
        const publicId = getPublicIdFromUrl(url);
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await blog.destroy();
    res.json({ message: "Blog eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar blog:", error);
    res.status(500).json({ message: "Error al eliminar el blog" });
  }
};


// Actualizar el estado de un blog (de Draft a Published o viceversa)
exports.updateBlogStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body // El nuevo estado, que debe ser "draft" o "published"

  try {
    // Verificar si el estado es válido
    if (status !== "draft" && status !== "published") {
      return res.status(400).json({ message: "Estado inválido. Debe ser 'draft' o 'published'." })
    }

    const blog = await Blog.findByPk(id)

    if (!blog) {
      return res.status(404).json({ message: "Blog no encontrado" })
    }

    // Actualizar el estado
    await blog.update({ status })

    res.json({ message: `Estado del blog actualizado a ${status}.`, blog })
  } catch (error) {
    console.error("Error al actualizar el estado del blog:", error)
    res.status(500).json({ message: "Error al actualizar el estado del blog." })
  }
}

// Obtener un blog por su ID
exports.getBlogById = async (req, res) => {
  const { id } = req.params

  try {
    const blog = await Blog.findByPk(id) // Busca el blog por su ID

    if (!blog) {
      return res.status(404).json({ message: "Blog no encontrado" }) // Si no lo encuentra, devuelve un error
    }

    res.status(200).json(blog) // Si lo encuentra, devuelve el blog
  } catch (error) {
    console.error("Error al obtener el blog:", error)
    res.status(500).json({ message: "Error al obtener el blog." }) // Manejo de errores
  }
}
