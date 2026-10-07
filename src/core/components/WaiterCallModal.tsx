import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { Bell, Droplets, Utensils, Receipt, Send, Check } from 'lucide-react';
import { QizineApi } from '../api/axios';
import type { QRBoothContext } from '../types/order.types';

export interface WaiterCallModalProps {
  open: boolean;
  onClose: () => void;
  booth?: QRBoothContext;
  qrKey?: string;
}

const SERVICE_OPTIONS = [
  { id: 'CALL_WAITER', label: 'Call Waiter to Table', icon: Bell },
  { id: 'WATER', label: 'Request Water / Glasses', icon: Droplets },
  { id: 'CUTLERY', label: 'Request Cutlery / Tissues', icon: Utensils },
  { id: 'PRINT_BILL', label: 'Request Printed Bill', icon: Receipt },
];

export const WaiterCallModal: React.FC<WaiterCallModalProps> = ({
  open,
  onClose,
  booth,
  qrKey = 'qr_default',
}) => {
  const [selectedType, setSelectedType] = useState<string>('CALL_WAITER');
  const [customNote, setCustomNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await QizineApi.sendServiceRequest({
        qr_key: qrKey,
        type: selectedType,
        custom_note: customNote.trim() || undefined,
      });
      message.success('Staff notified! Someone will assist you shortly at your table.');
      setCustomNote('');
      onClose();
    } catch {
      message.error('Could not reach staff. Please wave down a floor associate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={420}
      className="p-0 overflow-hidden rounded-3xl"
    >
      <div className="bg-surface text-gray-900 p-5 rounded-3xl space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Floor Assistance</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-gray-900 leading-tight">
            How can we assist you?
          </h3>
          {booth && (
            <p className="text-xs text-muted mt-0.5">
              Assisting {booth.booth_label} ({booth.vendor_name})
            </p>
          )}
        </div>

        {/* Option Chips */}
        <div className="grid grid-cols-1 gap-2">
          {SERVICE_OPTIONS.map((opt) => {
            const isSelected = selectedType === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedType(opt.id)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary shadow-xs font-semibold'
                    : 'border-black/10 hover:border-black/20 text-gray-800 bg-surface'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-gray-500'}`} />
                  <span className="text-xs">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>

        {/* Custom Note */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Special Request (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Extra napkins, clean table..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl bg-gray-100 border border-transparent focus:border-primary focus:bg-white focus:outline-none transition"
            maxLength={100}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-soft flex items-center justify-center space-x-2 hover:opacity-95 transition disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? 'Sending Request...' : 'Notify Floor Staff'}</span>
        </button>
      </div>
    </Modal>
  );
};
