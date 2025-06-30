const axios = require("axios");
require("dotenv").config();

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API } = process.env;

// Obtener el token de acceso
async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

// Crear orden de pago
exports.createOrder = async (req, res) => {
  try {
    const token = await getAccessToken();

    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "10.00", // Aquí puedes usar req.body.total por ejemplo
          },
        },
      ],
      application_context: {
        return_url: "http://localhost:3000/success", // tu frontend
        cancel_url: "http://localhost:3000/cancel",
      },
    };

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, order, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error al crear orden:", error.response?.data || error);
    res.status(500).json({ error: "No se pudo crear la orden" });
  }
};

// Capturar el pago después de aprobarlo
exports.captureOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const token = await getAccessToken();

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error al capturar orden:", error.response?.data || error);
    res.status(500).json({ error: "No se pudo capturar la orden" });
  }
};
