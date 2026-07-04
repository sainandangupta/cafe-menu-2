import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsService } from '../../services/settings';
import { SettingsSchema, SettingsInput } from '../../utils/validators';

interface SettingsPageProps {
  cafeId: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ cafeId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    register,
    watch,
  } = useForm<any>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      gst_percentage: 5,
      tax_type: 'total',
      logo_url: '',
      open_time: '08:00',
      close_time: '22:00',
      closed_days: [],
      email_notifications: true,
      sound_alerts: true,
    },
  });

  const logoUrl = watch('logo_url');
  const emailNotifications = watch('email_notifications');
  const soundAlerts = watch('sound_alerts');

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const cafeDetails = await settingsService.getCafeDetails(cafeId);
        const rawSettings = await settingsService.getSettings(cafeId);

        setValue('name', cafeDetails.name);
        setValue('email', cafeDetails.email || '');
        setValue('phone', cafeDetails.phone || '');
        setValue('address', cafeDetails.address || '');
        setValue('gst_percentage', Number(cafeDetails.gst_percentage));

        if (rawSettings.tax_type) setValue('tax_type', rawSettings.tax_type as 'item' | 'total');
        if (rawSettings.logo_url) setValue('logo_url', rawSettings.logo_url);
        if (rawSettings.open_time) setValue('open_time', rawSettings.open_time);
        if (rawSettings.close_time) setValue('close_time', rawSettings.close_time);
        if (rawSettings.closed_days) {
          try {
            setValue('closed_days', JSON.parse(rawSettings.closed_days));
          } catch {
            setValue('closed_days', []);
          }
        }
        if (rawSettings.email_notifications) {
          setValue('email_notifications', rawSettings.email_notifications === 'true');
        }
        if (rawSettings.sound_alerts) {
          setValue('sound_alerts', rawSettings.sound_alerts === 'true');
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [cafeId, setValue]);

  const onFormSubmit = async (data: SettingsInput) => {
    setSaving(true);
    try {
      await settingsService.updateCafeDetails(cafeId, {
        name: data.name,
        email: data.email || null as any,
        phone: data.phone || null as any,
        address: data.address || null as any,
        gst_percentage: Number(data.gst_percentage),
      });

      const settingsPayload: Record<string, string> = {
        tax_type: data.tax_type,
        logo_url: data.logo_url || '',
        open_time: data.open_time || '08:00',
        close_time: data.close_time || '22:00',
        closed_days: JSON.stringify(data.closed_days),
        email_notifications: String(data.email_notifications),
        sound_alerts: String(data.sound_alerts),
      };
      await settingsService.updateSettings(cafeId, settingsPayload);

      localStorage.setItem('sound_alerts', String(data.sound_alerts));
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-semibold">Retrieving cafe settings profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Basic Info & Tax (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-150 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">storefront</span>
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cafe Name</label>
                <input
                  type="text"
                  placeholder="e.g. QuickCafe Downtown"
                  className="input-field"
                  {...register('name')}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact Email</label>
                <input
                  type="email"
                  placeholder="hello@quickcafe.com"
                  className="input-field"
                  {...register('email')}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 012-3456"
                  className="input-field"
                  {...register('phone')}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Website (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="input-field"
                  {...register('logo_url')} // logo_url reused as logo URL in backend
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Address</label>
              <textarea
                placeholder="123 Espresso Lane, Suite 4B, Metro District..."
                rows={3}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                {...register('address')}
              />
            </div>
          </div>

          {/* Tax & Billing */}
          <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-150 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">payments</span>
              Tax & Billing
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">GST Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="18"
                  className="input-field"
                  {...register('gst_percentage', { valueAsNumber: true })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tax Inclusion</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
                    <input
                      type="radio"
                      value="total"
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      {...register('tax_type')}
                    />
                    <span>Exclusive of Tax</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
                    <input
                      type="radio"
                      value="item"
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      {...register('tax_type')}
                    />
                    <span>Inclusive of Tax</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Appearance & Alerts (1/3 width) */}
        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-150 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">palette</span>
              Appearance
            </h3>
            
            <div className="flex flex-col items-center space-y-3 py-2">
              <div className="w-24 h-24 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <span className="material-symbols-outlined text-3xl mb-1">local_cafe</span>
                <span className="text-[10px]">Change Logo</span>
              </div>
              <button type="button" className="px-3 py-1.5 bg-white border border-gray-250 text-gray-600 rounded text-xs font-bold hover:bg-gray-50 cursor-pointer">
                Change Logo
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Accent Color</label>
              <div className="flex gap-2">
                <button type="button" className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-600"></button>
                <button type="button" className="w-6 h-6 rounded-full bg-[#fea619] border-2 border-white hover:ring-2 hover:ring-orange-300"></button>
                <button type="button" className="w-6 h-6 rounded-full bg-gray-600 border-2 border-white hover:ring-2 hover:ring-gray-300"></button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Theme</label>
              <select className="input-field bg-white py-2 text-xs cursor-pointer">
                <option>System Default</option>
                <option>Light Theme</option>
                <option>Dark Theme</option>
              </select>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-150 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">notifications</span>
              Alerts
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-gray-700">Email Notifications</p>
                  <p className="text-[10px] text-gray-400">Daily summaries</p>
                </div>
                <div
                  onClick={() => setValue('email_notifications', !emailNotifications)}
                  className={`toggle-switch ${emailNotifications ? 'active-blue' : ''}`}
                ></div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-gray-700">Audio Alerts</p>
                  <p className="text-[10px] text-gray-400">Sound on new orders</p>
                </div>
                <div
                  onClick={() => setValue('sound_alerts', !soundAlerts)}
                  className={`toggle-switch ${soundAlerts ? 'active-blue' : ''}`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-150 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">schedule</span>
          Business Hours
        </h3>
        
        <div className="space-y-3.5 max-w-3xl">
          {[
            { label: 'Mon - Fri', open: '08:00 AM', close: '10:00 PM', status: 'OPEN', statusColor: 'bg-green-50 text-green-700' },
            { label: 'Saturday', open: '10:00 AM', close: '11:30 PM', status: 'OPEN', statusColor: 'bg-green-50 text-green-700' },
            { label: 'Sunday', open: '--:--', close: '--:--', status: 'CLOSED', statusColor: 'bg-red-50 text-red-700' },
          ].map((day, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-gray-50 border border-gray-150 rounded-lg">
              <span className="text-xs font-bold text-gray-700 w-24 text-left">{day.label}</span>
              
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  defaultValue={day.open}
                  className="w-28 text-center px-3 py-1.5 bg-white border border-gray-200 rounded text-xs outline-none"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="text"
                  defaultValue={day.close}
                  className="w-28 text-center px-3 py-1.5 bg-white border border-gray-200 rounded text-xs outline-none"
                />
              </div>

              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${day.statusColor}`}>
                {day.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Submission Controls */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-secondary py-2 px-4 text-xs w-auto border-none hover:bg-gray-100"
        >
          Discard Changes
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary-blue py-2.5 px-6 text-xs flex items-center gap-1.5"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm font-bold">save</span>
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Success Save Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#006e2f] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-green-300">check_circle</span>
          Settings saved successfully
        </div>
      )}
    </form>
  );
};

export default SettingsPage;
