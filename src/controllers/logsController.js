const path = require("path");
const fs = require("fs/promises"); // Asegúrate también de tener esta línea si usas fs.promises

exports.getLogsByDate = async (req, res) => {
    const rawDate = req.params.date
    const date = rawDate.replace(/^:/, "") // Elimina ":" inicial si existe
    const logFileName = `Log-${date}.log`
    try {
        // Construye la ruta completa al archivo de log
        // Asume que los archivos de log están en una carpeta 'logs' en la raíz de este proyecto de backend
        const logFilePath = path.join(__dirname, "..", "logs", logFileName)

        let fileContent
        try {
            fileContent = await fs.readFile(logFilePath, "utf-8")
        } catch (readError) {
            if (readError.code === "ENOENT") {
                // Si el archivo no existe, devuelve un array vacío y un estado 200
              
                return res.status(200).json([])
            }
            throw readError // Re-lanza otros errores de lectura
        }
       
        // Divide el contenido por líneas y parsea cada línea como un objeto JSON
        const logEntries = fileContent
            .split("\n")
            .filter((line) => line.trim() !== "") // Filtra líneas vacías
            .map((line, index) => {
                try {
                    return JSON.parse(line)
                } catch (parseError) {
                    console.error(`[Backend] Error al parsear la línea ${index + 1} del log ${logFileName}:`, parseError)
                    // Devuelve un objeto de error para la línea malformada
                    return {
                        id: `error-${date}-${index}`,
                        level: "ERROR",
                        mensaje: `Error al parsear la línea: ${line.substring(0, 100)}...`,
                        ruta: "N/A",
                        timestamp: new Date().toISOString(),
                        ip: "N/A",
                        metodo: "N/A",
                        protocolo: "N/A",
                    }
                }
            })

        res.status(200).json(logEntries)
    } catch (error) {
        console.error(`[Backend] Error interno del servidor al obtener logs para la fecha ${date}:`, error)
        res.status(500).json({ message: "Error interno del servidor al obtener logs." })
    }
}