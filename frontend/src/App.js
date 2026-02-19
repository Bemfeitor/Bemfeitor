import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3002';

// Ícones SVG
const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Upload: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Sun: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Ban: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Clock: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Money: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

// Estilos CSS
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: #0a0f1a;
    color: #e2e8f0;
  }
  
  .app {
    min-height: 100vh;
  }
  
  /* Header/Navbar */
  .navbar {
    background: #111827;
    border-bottom: 1px solid #1f2937;
    padding: 0 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  
  .navbar-left {
    display: flex;
    align-items: center;
    gap: 40px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #60a5fa;
    font-size: 18px;
    font-weight: 600;
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .nav-tabs {
    display: flex;
    gap: 8px;
  }
  
  .nav-tab {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    background: transparent;
  }
  
  .nav-tab:hover {
    color: #e5e7eb;
    background: #1f2937;
  }
  
  .nav-tab.active {
    background: #3b82f6;
    color: white;
  }
  
  .theme-toggle {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
  }
  
  .theme-toggle:hover {
    background: #1f2937;
    color: #e5e7eb;
  }
  
  /* Main Content */
  .main-content {
    padding: 32px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  /* Page Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
  }
  
  .page-title-section h1 {
    font-size: 24px;
    font-weight: 600;
    color: #f9fafb;
    margin-bottom: 4px;
  }
  
  .page-subtitle {
    font-size: 14px;
    color: #6b7280;
  }
  
  .page-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .search-box {
    position: relative;
  }
  
  .search-input {
    width: 280px;
    padding: 10px 16px 10px 40px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 8px;
    color: #e5e7eb;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
  }
  
  .search-input:focus {
    border-color: #3b82f6;
  }
  
  .search-input::placeholder {
    color: #6b7280;
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
  }
  
  .btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #3b82f6;
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-primary:hover {
    background: #2563eb;
  }
  
  .btn-secondary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #374151;
    border: none;
    border-radius: 8px;
    color: #e5e7eb;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-secondary:hover {
    background: #4b5563;
  }
  
  /* Upload Section */
  .upload-section {
    background: #111827;
    border: 2px dashed #374151;
    border-radius: 12px;
    padding: 48px;
    text-align: center;
    margin-bottom: 32px;
  }
  
  .upload-icon {
    width: 64px;
    height: 64px;
    background: #1f2937;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: #3b82f6;
  }
  
  .upload-title {
    font-size: 18px;
    font-weight: 600;
    color: #f9fafb;
    margin-bottom: 8px;
  }
  
  .upload-description {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 24px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .upload-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  
  .link-download {
    color: #3b82f6;
    font-size: 14px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .link-download:hover {
    text-decoration: underline;
  }
  
  .divider {
    color: #4b5563;
  }
  
  /* Form Section */
  .form-section {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 32px;
  }
  
  .form-title {
    font-size: 18px;
    font-weight: 600;
    color: #f9fafb;
    margin-bottom: 24px;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .form-group.full-width {
    grid-column: span 3;
  }
  
  .form-label {
    font-size: 12px;
    font-weight: 500;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .form-input, .form-select {
    padding: 12px 16px;
    background: #0a0f1a;
    border: 1px solid #374151;
    border-radius: 8px;
    color: #e5e7eb;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
  }
  
  .form-input:focus, .form-select:focus {
    border-color: #3b82f6;
  }
  
  .form-input::placeholder {
    color: #4b5563;
  }
  
  .form-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 40px;
  }
  
  .form-select option {
    background: #111827;
    color: #e5e7eb;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #1f2937;
  }
  
  /* Table Section */
  .table-section {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 12px;
    overflow: hidden;
  }
  
  .table-header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #1f2937;
  }
  
  .table-title {
    font-size: 16px;
    font-weight: 600;
    color: #f9fafb;
  }
  
  .table-count {
    background: #1f2937;
    color: #9ca3af;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .table thead {
    background: #0a0f1a;
  }
  
  .table th {
    padding: 14px 24px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .table tbody tr {
    border-bottom: 1px solid #1f2937;
  }
  
  .table tbody tr:last-child {
    border-bottom: none;
  }
  
  .table tbody tr:hover {
    background: #1f2937;
  }
  
  .table td {
    padding: 16px 24px;
    font-size: 14px;
    color: #e5e7eb;
  }
  
  .cliente-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .cliente-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
  }
  
  .cliente-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .cliente-nome {
    font-weight: 500;
    color: #f9fafb;
  }
  
  .cliente-doc {
    font-size: 12px;
    color: #6b7280;
  }
  
  .contato-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .contato-email {
    color: #e5e7eb;
  }
  
  .contato-telefone {
    font-size: 12px;
    color: #6b7280;
  }
  
  /* Status Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .badge-regular {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }
  
  .badge-restrito {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }
  
  .badge-analise {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }
  
  .badge-aberto {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }
  
  .badge-pago {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }
  
  .badge-vencido {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }
  
  /* Actions */
  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .action-btn:hover {
    background: #374151;
    color: #e5e7eb;
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #1f2937;
  }
  
  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #f9fafb;
  }
  
  .modal-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .modal-close:hover {
    background: #374151;
    color: #e5e7eb;
  }
  
  .modal-body {
    padding: 24px;
    overflow-y: auto;
    max-height: calc(90vh - 140px);
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #1f2937;
    background: #0a0f1a;
  }
  
  /* Success Message */
  .success-message {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #22c55e;
  }
  
  .success-icon {
    width: 24px;
    height: 24px;
    background: #22c55e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  /* Loading */
  .loading {
    text-align: center;
    padding: 60px;
    color: #6b7280;
  }
  
  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 60px;
    color: #6b7280;
  }
  
  /* Responsive */
  @media (max-width: 1024px) {
    .form-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .form-group.full-width {
      grid-column: span 2;
    }
  }
  
  @media (max-width: 768px) {
    .navbar {
      padding: 0 16px;
    }
    .nav-tabs {
      display: none;
    }
    .main-content {
      padding: 16px;
    }
    .form-grid {
      grid-template-columns: 1fr;
    }
    .form-group.full-width {
      grid-column: span 1;
    }
    .kpi-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

function App() {
  const [activeTab, setActiveTab] = useState('emitir');
  const [clientes, setClientes] = useState([]);
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form states
  const [boletoForm, setBoletoForm] = useState({
    clienteId: '',
    seuNumero: '',
    valor: '',
    dataVencimento: '',
    descricao: ''
  });
  
  const [clienteForm, setClienteForm] = useState({
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [cliRes, bolRes] = await Promise.all([
        axios.get(`${API_URL}/clientes`),
        axios.get(`${API_URL}/boletos/pendentes`)
      ]);
      setClientes(Array.isArray(cliRes.data) ? cliRes.data : []);
      setBoletos(Array.isArray(bolRes.data) ? bolRes.data : []);
    } catch (e) {
      console.error('Erro ao carregar:', e);
    } finally {
      setLoading(false);
    }
  };

  const emitirBoleto = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...boletoForm,
        valor: parseFloat(boletoForm.valor)
      };
      const res = await axios.post(`${API_URL}/boletos`, payload);
      setSuccessMessage(`Boleto emitido com sucesso! Nosso Número: ${res.data.boleto.nossoNumero}`);
      setBoletoForm({ clienteId: '', seuNumero: '', valor: '', dataVencimento: '', descricao: '' });
      setShowModal(false);
      carregarDados();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (e) {
      alert('Erro ao emitir: ' + (e.response?.data?.message || e.message));
    }
  };

  const criarCliente = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/clientes`, clienteForm);
      setSuccessMessage('Cliente cadastrado com sucesso!');
      setClienteForm({ nome: '', documento: '', email: '', telefone: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '', cep: '' });
      setShowClienteModal(false);
      carregarDados();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (e) {
      alert('Erro ao cadastrar: ' + (e.response?.data?.message || e.message));
    }
  };

  const verBoleto = (nossoNumero) => {
    window.open(`${API_URL}/boletos/${nossoNumero}/pdf`, '_blank');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (boleto) => {
    if (boleto.statusDescricao === 'PAGO') {
      return <span className="badge badge-pago"><Icons.Check /> Pago</span>;
    }
    if (new Date(boleto.dataVencimento) < new Date()) {
      return <span className="badge badge-vencido"><Icons.AlertCircle /> Vencido</span>;
    }
    return <span className="badge badge-aberto"><Icons.Clock /> Em Aberto</span>;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const maskDocument = (doc) => {
    if (doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
    }
    return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.***.***/$4-$5');
  };

  const filteredClientes = clientes.filter(c => 
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.documento?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderEmitirBoleto = () => (
    <>
      {successMessage && (
        <div className="success-message">
          <div className="success-icon"><Icons.Check /></div>
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="upload-section">
        <div className="upload-icon">
          <Icons.Upload />
        </div>
        <h3 className="upload-title">Cadastro em Lote</h3>
        <p className="upload-description">
          Arraste e solte sua planilha (XLSX, CSV) ou clique para selecionar. 
          Importe múltiplos boletos instantaneamente.
        </p>
        <div className="upload-actions">
          <a href="#" className="link-download">
            <Icons.Download /> Baixar Modelo .CSV
          </a>
          <span className="divider">|</span>
          <button className="btn-secondary">
            Selecionar Arquivo
          </button>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-title">Emitir Novo Boleto</h3>
        <form onSubmit={emitirBoleto}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Cliente *</label>
              <select 
                className="form-select"
                value={boletoForm.clienteId}
                onChange={(e) => setBoletoForm({...boletoForm, clienteId: e.target.value})}
                required
              >
                <option value="">Selecione o cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} - {c.documento}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Seu Número *</label>
              <input 
                type="text"
                className="form-input"
                placeholder="Nº controle interno"
                value={boletoForm.seuNumero}
                onChange={(e) => setBoletoForm({...boletoForm, seuNumero: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Valor *</label>
              <input 
                type="number"
                step="0.01"
                className="form-input"
                placeholder="0,00"
                value={boletoForm.valor}
                onChange={(e) => setBoletoForm({...boletoForm, valor: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Data de Vencimento *</label>
              <input 
                type="date"
                className="form-input"
                value={boletoForm.dataVencimento}
                onChange={(e) => setBoletoForm({...boletoForm, dataVencimento: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label className="form-label">Descrição / Observações</label>
              <input 
                type="text"
                className="form-input"
                placeholder="Descrição do serviço ou produto..."
                value={boletoForm.descricao}
                onChange={(e) => setBoletoForm({...boletoForm, descricao: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setBoletoForm({ clienteId: '', seuNumero: '', valor: '', dataVencimento: '', descricao: '' })}>
              Limpar
            </button>
            <button type="submit" className="btn-primary">
              <Icons.Plus /> Emitir Boleto
            </button>
          </div>
        </form>
      </div>

      <div className="table-section">
        <div className="table-header-section">
          <h3 className="table-title">Boletos Emitidos Recentemente</h3>
          <span className="table-count">{boletos.length} Boletos</span>
        </div>
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : boletos.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum boleto emitido ainda</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nosso Número</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {boletos.slice(0, 5).map(boleto => (
                <tr key={boleto.id}>
                  <td>{boleto.nossoNumero}</td>
                  <td>
                    <div className="cliente-cell">
                      <div className="cliente-avatar">{getInitials(boleto.cliente?.nome || 'C')}</div>
                      <div className="cliente-info">
                        <span className="cliente-nome">{boleto.cliente?.nome}</span>
                        <span className="cliente-doc">{maskDocument(boleto.cliente?.documento || '')}</span>
                      </div>
                    </div>
                  </td>
                  <td>{formatCurrency(boleto.valorNominal)}</td>
                  <td>{formatDate(boleto.dataVencimento)}</td>
                  <td>{getStatusBadge(boleto)}</td>
                  <td>
                    <div className="actions">
                      <button className="action-btn" onClick={() => verBoleto(boleto.nossoNumero)} title="Visualizar">
                        <Icons.Eye />
                      </button>
                      <button className="action-btn" title="Editar">
                        <Icons.Edit />
                      </button>
                      <button className="action-btn" title="Cancelar">
                        <Icons.Ban />
                      </button>
                      <button className="action-btn" title="Excluir">
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  const renderGestaoClientes = () => (
    <>
      {successMessage && (
        <div className="success-message">
          <div className="success-icon"><Icons.Check /></div>
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="upload-section">
        <div className="upload-icon">
          <Icons.Upload />
        </div>
        <h3 className="upload-title">Cadastro em Lote</h3>
        <p className="upload-description">
          Arraste e solte sua planilha (XLSX, CSV) ou clique para selecionar. 
          Importe múltiplos clientes instantaneamente.
        </p>
        <div className="upload-actions">
          <a href="#" className="link-download">
            <Icons.Download /> Baixar Modelo .CSV
          </a>
          <span className="divider">|</span>
          <button className="btn-secondary">
            Selecionar Arquivo
          </button>
        </div>
      </div>

      <div className="table-section">
        <div className="table-header-section">
          <h3 className="table-title">Clientes Registrados</h3>
          <span className="table-count">{clientes.length} Clientes</span>
        </div>
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : filteredClientes.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum cliente encontrado</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Crédito</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>
                    <div className="cliente-cell">
                      <div className="cliente-avatar">{getInitials(cliente.nome)}</div>
                      <div className="cliente-info">
                        <span className="cliente-nome">{cliente.nome}</span>
                        <span className="cliente-doc">
                          {cliente.tipoDocumento === '1' ? 'CPF' : 'CNPJ'}: {maskDocument(cliente.documento)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contato-info">
                      <span className="contato-email">{cliente.email}</span>
                      <span className="contato-telefone">{cliente.telefone}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-regular"><Icons.Check /> Regular</span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="action-btn" title="Visualizar">
                        <Icons.Eye />
                      </button>
                      <button className="action-btn" title="Editar">
                        <Icons.Edit />
                      </button>
                      <button className="action-btn" title="Bloquear">
                        <Icons.Ban />
                      </button>
                      <button className="action-btn" title="Excluir">
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  const renderBoletosEmitidos = () => (
    <div className="table-section">
      <div className="table-header-section">
        <h3 className="table-title">Todos os Boletos Emitidos</h3>
        <span className="table-count">{boletos.length} Boletos</span>
      </div>
      
      {loading ? (
        <div className="loading">Carregando...</div>
      ) : boletos.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum boleto emitido</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nosso Número</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {boletos.map(boleto => (
              <tr key={boleto.id}>
                <td>{boleto.nossoNumero}</td>
                <td>
                  <div className="cliente-cell">
                    <div className="cliente-avatar">{getInitials(boleto.cliente?.nome || 'C')}</div>
                    <div className="cliente-info">
                      <span className="cliente-nome">{boleto.cliente?.nome}</span>
                      <span className="cliente-doc">{maskDocument(boleto.cliente?.documento || '')}</span>
                    </div>
                  </div>
                </td>
                <td>{formatCurrency(boleto.valorNominal)}</td>
                <td>{formatDate(boleto.dataVencimento)}</td>
                <td>{getStatusBadge(boleto)}</td>
                <td>
                  <div className="actions">
                    <button className="action-btn" onClick={() => verBoleto(boleto.nossoNumero)} title="Visualizar">
                      <Icons.Eye />
                    </button>
                    <button className="action-btn" title="Editar">
                      <Icons.Edit />
                    </button>
                    <button className="action-btn" title="Cancelar">
                      <Icons.Ban />
                    </button>
                    <button className="action-btn" title="Excluir">
                      <Icons.Trash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-left">
            <div className="logo">
              <div className="logo-icon">
                <Icons.Logo />
              </div>
              <span>Audit-Cobranças</span>
            </div>
            
            <div className="nav-tabs">
              <button 
                className={`nav-tab ${activeTab === 'emitir' ? 'active' : ''}`}
                onClick={() => setActiveTab('emitir')}
              >
                Emitir Boleto
              </button>
              <button 
                className={`nav-tab ${activeTab === 'clientes' ? 'active' : ''}`}
                onClick={() => setActiveTab('clientes')}
              >
                Gestão de Clientes
              </button>
              <button 
                className={`nav-tab ${activeTab === 'boletos' ? 'active' : ''}`}
                onClick={() => setActiveTab('boletos')}
              >
                Boletos Emitidos
              </button>
            </div>
          </div>
          
          <button className="theme-toggle">
            <Icons.Sun />
          </button>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <h1>
                {activeTab === 'emitir' && 'Emitir Boleto'}
                {activeTab === 'clientes' && 'Gestão de Clientes'}
                {activeTab === 'boletos' && 'Boletos Emitidos'}
              </h1>
              <p className="page-subtitle">
                {activeTab === 'emitir' && 'Emita boletos individuais ou em lote para seus clientes.'}
                {activeTab === 'clientes' && 'Gerencie sua base de clientes e realize cadastros em massa.'}
                {activeTab === 'boletos' && 'Visualize e gerencie todos os boletos emitidos.'}
              </p>
            </div>
            
            <div className="page-actions">
              <div className="search-box">
                <span className="search-icon"><Icons.Search /></span>
                <input 
                  type="text" 
                  className="search-input"
                  placeholder={activeTab === 'clientes' ? "Buscar cliente..." : "Buscar boleto..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {activeTab === 'clientes' && (
                <button className="btn-primary" onClick={() => setShowClienteModal(true)}>
                  <Icons.Users /> Novo Cadastro
                </button>
              )}
              
              {activeTab === 'emitir' && (
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                  <Icons.Plus /> Emitir Boleto
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {activeTab === 'emitir' && renderEmitirBoleto()}
          {activeTab === 'clientes' && renderGestaoClientes()}
          {activeTab === 'boletos' && renderBoletosEmitidos()}
        </main>

        {/* Modal Emitir Boleto */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Emitir Novo Boleto</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <Icons.X />
                </button>
              </div>
              <form onSubmit={emitirBoleto}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Cliente *</label>
                      <select 
                        className="form-select"
                        value={boletoForm.clienteId}
                        onChange={(e) => setBoletoForm({...boletoForm, clienteId: e.target.value})}
                        required
                      >
                        <option value="">Selecione...</option>
                        {clientes.map(c => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Seu Número *</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={boletoForm.seuNumero}
                        onChange={(e) => setBoletoForm({...boletoForm, seuNumero: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Valor *</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={boletoForm.valor}
                        onChange={(e) => setBoletoForm({...boletoForm, valor: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Data Vencimento *</label>
                      <input 
                        type="date"
                        className="form-input"
                        value={boletoForm.dataVencimento}
                        onChange={(e) => setBoletoForm({...boletoForm, dataVencimento: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label className="form-label">Descrição</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={boletoForm.descricao}
                        onChange={(e) => setBoletoForm({...boletoForm, descricao: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    <Icons.Plus /> Emitir Boleto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Novo Cliente */}
        {showClienteModal && (
          <div className="modal-overlay" onClick={() => setShowClienteModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Novo Cadastro de Cliente</h3>
                <button className="modal-close" onClick={() => setShowClienteModal(false)}>
                  <Icons.X />
                </button>
              </div>
              <form onSubmit={criarCliente}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">Nome Completo *</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={clienteForm.nome}
                        onChange={(e) => setClienteForm({...clienteForm, nome: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">CPF/CNPJ *</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={clienteForm.documento}
                        onChange={(e) => setClienteForm({...clienteForm, documento: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">E-mail *</label>
                      <input 
                        type="email"
                        className="form-input"
                        value={clienteForm.email}
                        onChange={(e) => setClienteForm({...clienteForm, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Telefone *</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={clienteForm.telefone}
                        onChange={(e) => setClienteForm({...clienteForm, telefone: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">CEP *</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={clienteForm.cep}
                        onChange={(e) => setClienteForm({...clienteForm, cep: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Logradouro *</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={clienteForm.logradouro}
                        onChange={(e) => setClienteForm({...clienteForm, logradouro: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Número *</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={clienteForm.numero}
                        onChange={(e) => setClienteForm({...clienteForm, numero: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Bairro *</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={clienteForm.bairro}
                        onChange={(e) => setClienteForm({...clienteForm, bairro: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Cidade *</label>
                      <input 
                        type="text"
                        className="form-input"
                        value={clienteForm.cidade}
                        onChange={(e) => setClienteForm({...clienteForm, cidade: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">UF *</label>
                      <input 
                        type="text"
                        className="form-input"
                        maxLength="2"
                        value={clienteForm.uf}
                        onChange={(e) => setClienteForm({...clienteForm, uf: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowClienteModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    <Icons.Users /> Cadastrar Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
