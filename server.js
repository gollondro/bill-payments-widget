require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// CONFIGURACIÓN - Carga desde variables de entorno
// ============================================
const CONFIG = {
  widget: {
    pathUrl: process.env.WIDGET_PATH_URL || '',
    clientId: process.env.WIDGET_CLIENT_ID || ''
  },
  api: {
    url: process.env.API_URL || '',
    clientId: process.env.API_CLIENT_ID || '',
    clientSecret: process.env.API_CLIENT_SECRET || ''
  }
};

// Cache del token
let tokenCache = {
  accessToken: null,
  expiresAt: null
};

// ============================================
// AUTENTICACIÓN - Client Credentials
// ============================================
async function getAccessToken() {
  // Verificar si el token está cacheado y válido
  if (tokenCache.accessToken && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken;
  }

  try {
    const response = await axios.post(
      `${CONFIG.api.url}/login`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CONFIG.api.clientId,
        client_secret: CONFIG.api.clientSecret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    const { access_token, expires_in } = response.data;
    
    // Cachear token (expires_in - 5 segundos de margen)
    tokenCache = {
      accessToken: access_token,
      expiresAt: Date.now() + (expires_in - 5) * 1000
    };

    return access_token;
  } catch (error) {
    console.error('Error obteniendo token:', error.response?.data || error.message);
    throw new Error('Error de autenticación');
  }
}

// ============================================
// API: Configuración del Widget
// ============================================
app.get('/api/config', (req, res) => {
  res.json({
    widgetBaseUrl: CONFIG.widget.pathUrl,
    clientId: CONFIG.widget.clientId
  });
});

// ============================================
// API: Pagar Servicio (SERVICE)
// ============================================
app.post('/api/pay/service', async (req, res) => {
  try {
    const { quoteId, amount, costAmount, externalReferenceId, paymentMethod = 'DEBIT' } = req.body;
    
    const token = await getAccessToken();
    
    const response = await axios.post(
      `${CONFIG.api.url}/services/quotes/${quoteId}/payments`,
      {
        externalReferenceId,
        externalPaymentMethod: paymentMethod,
        amount,
        costAmount
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error pagando servicio:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error procesando pago',
      details: error.response?.data || error.message
    });
  }
});

// ============================================
// API: Pagar Recarga (RECHARGE)
// ============================================
app.post('/api/pay/recharge', async (req, res) => {
  try {
    const { 
      quoteId, 
      amount, 
      costAmount, 
      externalReferenceId, 
      identifierName, 
      identifierValue,
      paymentMethod = 'DEBIT' 
    } = req.body;
    
    const token = await getAccessToken();
    
    const response = await axios.post(
      `${CONFIG.api.url}/topups/recharges/quotes/${quoteId}/payments`,
      {
        externalReferenceId,
        externalPaymentMethod: paymentMethod,
        amount,
        costAmount,
        identifierName,
        identifierValue
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error pagando recarga:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error procesando recarga',
      details: error.response?.data || error.message
    });
  }
});

// ============================================
// API: Pagar Voucher (VOUCHER)
// ============================================
app.post('/api/pay/voucher', async (req, res) => {
  try {
    const { quoteId, amount, costAmount, externalReferenceId, paymentMethod = 'DEBIT' } = req.body;
    
    const token = await getAccessToken();
    
    const response = await axios.post(
      `${CONFIG.api.url}/topups/vouchers/quotes/${quoteId}/payments`,
      {
        externalReferenceId,
        externalPaymentMethod: paymentMethod,
        amount,
        costAmount
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error pagando voucher:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error procesando voucher',
      details: error.response?.data || error.message
    });
  }
});

// ============================================
// API: Consultar Estado de Operación
// ============================================
app.get('/api/operation/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${CONFIG.api.url}/operation/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error consultando operación:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error consultando estado',
      details: error.response?.data || error.message
    });
  }
});

// Servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📦 Widget URL: ${CONFIG.widget.pathUrl}`);
});
