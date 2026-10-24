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
      <div className="bg-[#FAF4EE] text-stone-900 p-5 sm:p-6 rounded-3xl space-y-4 font-sans">
        <div>
          <div className="flex items-center space-x-2 text-[#FF385C] font-black text-xs uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4 stroke-[2.5]" />
            <span>Floor Assistance</span>
          </div>
          <h3 className="font-black text-lg sm:text-xl text-stone-900 leading-tight">
            How can we assist you?
          </h3>
          {booth && (
            <p className="text-xs text-stone-500 font-medium mt-1">
              Assisting {booth.booth_label} ({booth.vendor_name})
            </p>
          )}
        </div>

        {/* Option Chips */}
        <div className="grid grid-cols-1 gap-2.5">
          {SERVICE_OPTIONS.map((opt) => {
            const isSelected = selectedType === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedType(opt.id)}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#FF385C] bg-red-50 text-[#FF385C] shadow-xs font-black'
                    : 'border-stone-200/80 bg-white hover:border-stone-300 text-stone-800 font-bold'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#FF385C] stroke-[2.5]' : 'text-stone-400'}`} />
                  <span className="text-xs sm:text-sm">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#FF385C] stroke-[2.5]" />}
              </button>
            );
          })}
        </div>

        {/* Custom Note */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-black uppercase tracking-wider text-stone-400 block ml-1">
            Special Request (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Extra napkins, clean table..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="w-full text-xs sm:text-sm p-3 rounded-2xl bg-white border border-stone-200/90 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30 focus:border-[#FF385C] transition shadow-2xs"
            maxLength={100}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 px-4 bg-[#FF385C] hover:bg-[#E0294C] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-500/25 flex items-center justify-center space-x-2 active:scale-95 transition disabled:opacity-50"
        >
          <Send className="w-4 h-4 stroke-[2.2]" />
          <span>{loading ? 'Sending Request...' : 'Notify Floor Staff'}</span>
        </button>
      </div>
    </Modal>
  );
};
