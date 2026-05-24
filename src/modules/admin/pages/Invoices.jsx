import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../../core/contexts/ToastContext';
import invoicesService from '../services/invoices.service';
import pdfService from '../../../core/services/pdf.service';
import productsService from '../../public/services/products.service';

export default function AdminInvoices() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    documentNumber: '',
    address: '',
    notes: '',
    items: [{ name: '', quantity: 1, unitPrice: 0 }],
  });
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    loadInvoices();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsService.findAll();
      setAvailableProducts(data.data || data); // Adjust depending on pagination
    } catch (err) {
      console.error(err);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoicesService.findAll();
      setInvoices(data);
    } catch (err) {
      addToast(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setForm(prev => {
      const newItems = [...prev.items];
      newItems[index][field] = value;
      
      // Auto-fill price if a product is selected
      if (field === 'name') {
        const selectedProd = availableProducts.find(p => p.name === value);
        if (selectedProd) {
          newItems[index].unitPrice = Number(selectedProd.price || 0);
        }
      }
      
      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate subtotals before submitting
      const itemsWithSubtotals = form.items.map(item => ({
        ...item,
        subtotal: item.quantity * item.unitPrice
      }));

      await invoicesService.create({
        ...form,
        items: itemsWithSubtotals
      });
      
      addToast('Boleta generada con éxito', 'success');
      setModalOpen(false);
      setForm({
        customerName: '',
        documentNumber: '',
        address: '',
        notes: '',
        items: [{ name: '', quantity: 1, unitPrice: 0 }],
      });
      loadInvoices();
    } catch (err) {
      addToast(t('common.error'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta boleta?')) {
      try {
        await invoicesService.delete(id);
        addToast('Boleta eliminada', 'success');
        loadInvoices();
      } catch (err) {
        addToast(t('common.error'), 'error');
      }
    }
  };

  const handleExportPDF = async (invoice) => {
    try {
      await pdfService.generateInvoicePDF(invoice);
      addToast('PDF generado correctamente', 'success');
    } catch (err) {
      console.error(err);
      addToast('Error al generar PDF', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#134074]">Boletas y Recibos</h1>
          <p className="text-[#A5C0D8] text-sm mt-1">Genera boletas libres y manuales para tus clientes.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#134074] hover:bg-[#13315C] text-[#EEF4ED] px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Crear Boleta Manual
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#C5D8E8]/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-[#FAFAFA] text-xs uppercase text-[#A5C0D8] border-b border-[#C5D8E8]/30">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Número</th>
                <th className="px-6 py-4 font-medium tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-medium tracking-wider">Fecha</th>
                <th className="px-6 py-4 font-medium tracking-wider">Total</th>
                <th className="px-6 py-4 font-medium tracking-wider">Estado</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5D8E8]/20">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">Cargando...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">No hay boletas creadas.</td>
                </tr>
              ) : (
                invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#134074]">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-gray-800">{invoice.customerName}</td>
                    <td className="px-6 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">S/ {Number(invoice.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-blue-50 text-blue-600">
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleExportPDF(invoice)}
                          className="p-1.5 rounded-lg text-[#134074] hover:bg-blue-50 transition-colors"
                          title="Descargar PDF"
                        >
                          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-[#C5D8E8]/30">
              <h2 className="text-xl font-bold text-[#134074]">Crear Boleta Libre</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#A5C0D8] hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#134074] mb-1">Nombre del Cliente *</label>
                  <input
                    required
                    type="text"
                    value={form.customerName}
                    onChange={e => setForm({...form, customerName: e.target.value})}
                    className="w-full bg-gray-50 border border-[#C5D8E8]/50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#134074]/20 focus:border-[#134074]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#134074] mb-1">Documento (DNI/RUC)</label>
                  <input
                    type="text"
                    value={form.documentNumber}
                    onChange={e => setForm({...form, documentNumber: e.target.value})}
                    className="w-full bg-gray-50 border border-[#C5D8E8]/50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#134074]/20 focus:border-[#134074]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134074] mb-1">Dirección</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full bg-gray-50 border border-[#C5D8E8]/50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#134074]/20 focus:border-[#134074]"
                />
              </div>

              <div className="border border-[#C5D8E8]/30 rounded-lg overflow-hidden">
                <div className="bg-[#FAFAFA] px-4 py-3 border-b border-[#C5D8E8]/30 flex justify-between items-center">
                  <h3 className="font-semibold text-[#134074] text-sm">Detalle de Boleta</h3>
                  <button type="button" onClick={handleAddItem} className="text-xs font-medium text-[#134074] hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add_circle</span> Añadir Fila
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            required
                            list={`products-list-${idx}`}
                            placeholder="Descripción del producto/servicio (escribe o selecciona)"
                            type="text"
                            value={item.name}
                            onChange={e => handleItemChange(idx, 'name', e.target.value)}
                            className="w-full bg-white border border-[#C5D8E8]/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#134074]"
                          />
                          <datalist id={`products-list-${idx}`}>
                            {Array.isArray(availableProducts) && availableProducts.map(p => (
                              <option key={p.id} value={p.name} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      <div className="w-24">
                        <input
                          required
                          type="number"
                          min="1"
                          placeholder="Cant."
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full bg-white border border-[#C5D8E8]/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#134074]"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          required
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Precio Un."
                          value={item.unitPrice}
                          onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full bg-white border border-[#C5D8E8]/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#134074]"
                        />
                      </div>
                      <div className="w-32 pt-2 text-right font-medium text-gray-800">
                        S/ {(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 text-red-400 hover:text-red-600">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-[#C5D8E8]/30 pt-3 mt-3 flex justify-between items-center font-bold text-lg text-[#134074]">
                    <span>Total:</span>
                    <span>S/ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134074] mb-1">Notas adicionales (Opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  rows="2"
                  className="w-full bg-gray-50 border border-[#C5D8E8]/50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#134074]/20 focus:border-[#134074]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#C5D8E8]/30">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 rounded-lg font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-medium bg-[#134074] text-white hover:bg-[#13315C] transition-colors"
                >
                  Emitir Boleta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
