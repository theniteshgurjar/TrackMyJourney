import React, { useState } from 'react';
import axios from 'axios';
import { Ticket, Search, CheckCircle2, AlertCircle, Clock, ShieldCheck, ArrowRight, User, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const PnrStatus = () => {
  const [pnrNumber, setPnrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [pnrData, setPnrData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [refund, setRefund] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  const handleCheckPnr = async (e) => {
    if (e) e.preventDefault();
    const cleanPnr = pnrNumber.trim();
    if (!cleanPnr || cleanPnr.length < 10) {
      toast.error('Please enter a valid 10-digit PNR number');
      return;
    }

    setLoading(true);
    setErrorNotice(null);
    try {
      const [resStatus, resPred, resRef] = await Promise.all([
        axios.get(`http://localhost:5000/api/pnr/${cleanPnr}`),
        axios.get(`http://localhost:5000/api/pnr/${cleanPnr}/prediction`).catch(() => ({ data: { data: null } })),
        axios.get(`http://localhost:5000/api/pnr/${cleanPnr}/refund`).catch(() => ({ data: { data: null } }))
      ]);

      if (resStatus.data?.success) {
        setPnrData(resStatus.data.data);
        setPrediction(resPred.data?.data || null);
        setRefund(resRef.data?.data || null);
        toast.success('PNR status retrieved');
      } else {
        setPnrData(null);
        const msg = resStatus.data?.error?.message || 'Could not find PNR details';
        setErrorNotice(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error(err);
      setPnrData(null);
      const msg = err.response?.data?.error?.message || 'Failed to retrieve PNR details';
      setErrorNotice(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-28">
      
      {/* Master Card Wrapper */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.05)] border border-slate-100 p-6 sm:p-10 lg:p-12 mb-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 font-display block mb-1">
            PRS MAINFRAME ENQUIRY
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
            10-Digit PNR Status
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-500 mt-2">
            Real-time booking confirmation status, passenger berth allocations, confirmation forecast, and cancellation refund calculator.
          </p>
        </div>

        {/* PNR Search Form */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-4 sm:p-6 mb-8 shadow-sm max-w-3xl">
          <form onSubmit={handleCheckPnr} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            <div className="md:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Ticket className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  10-Digit PNR Number
                </span>
                <input
                  type="text"
                  maxLength={10}
                  value={pnrNumber}
                  onChange={(e) => setPnrNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit PNR number"
                  className="w-full font-display font-black text-base text-slate-900 tracking-wider bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-navy w-full py-4 px-6 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Search className="w-4 h-4 stroke-[3]" />
                <span>{loading ? 'Checking...' : 'Check Status'}</span>
              </button>
            </div>

          </form>
        </div>

        {errorNotice && !pnrData && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl p-6 mb-8 max-w-3xl flex items-start gap-4 shadow-sm animate-fade-in">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-black text-sm text-amber-900">PNR Enquiry Notice</h4>
              <p className="text-xs font-semibold text-amber-800 mt-1 leading-relaxed">
                {errorNotice}
              </p>
              <p className="text-[11px] text-amber-700 mt-2 font-medium">
                Please make sure the 10-digit PNR is a valid active reservation on Indian Railways (IRCTC / PRS).
              </p>
            </div>
          </div>
        )}

        {/* RESULTS SECTION */}
        {pnrData && (
          <div className="space-y-6">
            
            {/* Train & Journey Summary Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                      #{pnrData.train?.number}
                    </span>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      PNR: {pnrData.pnrNumber}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900">
                    {pnrData.train?.name}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    {pnrData.train?.source?.name} ({pnrData.train?.source?.code}) ➔ {pnrData.train?.destination?.name} ({pnrData.train?.destination?.code})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-2xl border text-xs font-black flex items-center gap-1.5 ${
                    pnrData.charting?.isPrepared
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${pnrData.charting?.isPrepared ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span>{pnrData.charting?.status || 'Chart Status'}</span>
                  </div>

                  {pnrData.charting?.chartUrl && (
                    <a
                      href={pnrData.charting.chartUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-black hover:bg-slate-100 transition-colors"
                    >
                      View Live Chart
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="bg-white rounded-2xl p-3 border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Journey Date</span>
                  <span className="font-display font-black text-sm text-slate-900">{pnrData.journey?.date || 'N/A'}</span>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Class & Quota</span>
                  <span className="font-display font-black text-sm text-slate-900">{pnrData.journey?.class} • {pnrData.journey?.quota} Quota</span>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Boarding At</span>
                  <span className="font-display font-black text-sm text-slate-900">{pnrData.train?.boardingPoint?.code || 'N/A'}</span>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Booking Fare</span>
                  <span className="font-display font-black text-sm text-slate-900">₹{pnrData.journey?.bookingFare || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Passengers Table */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
              <h3 className="font-display font-black text-slate-900 text-base mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-700" />
                <span>Passenger Status Details</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Booking Status</th>
                      <th className="py-2.5 px-3">Current Status</th>
                      <th className="py-2.5 px-3">Coach</th>
                      <th className="py-2.5 px-3">Berth No</th>
                      <th className="py-2.5 px-3">Berth Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-800">
                    {pnrData.passengers?.map((p) => (
                      <tr key={p.passengerNumber} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-slate-400 font-mono">P{p.passengerNumber}</td>
                        <td className="py-3 px-3 text-slate-500">{p.bookingStatus}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                            p.isConfirmed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {p.currentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-slate-900">{p.coach || '-'}</td>
                        <td className="py-3 px-3 font-mono font-black text-slate-900">{p.berthNumber || '-'}</td>
                        <td className="py-3 px-3">
                          {p.berthCode ? (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                              {p.berthCode} ({p.berthCode === 'LB' ? 'Lower' : p.berthCode === 'MB' ? 'Middle' : p.berthCode === 'UB' ? 'Upper' : p.berthCode === 'SL' ? 'Side Lower' : 'Side Upper'})
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Row: Prediction + Cancellation Refund */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Prediction Card */}
              {prediction && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-800" /> CONFIRMATION PREDICTION
                    </span>
                    <h4 className="font-display font-black text-lg text-slate-900">
                      {prediction.header}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      Calculated using historical waitlist clearance trends on Indian Railways.
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Probability</span>
                      <span className="font-display font-black text-2xl text-blue-900">{Math.round(prediction.probability * 100)}%</span>
                    </div>
                    <div className="w-24 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-900 h-full rounded-full transition-all"
                        style={{ width: `${Math.round(prediction.probability * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Refund Card */}
              {refund && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> CANCELLATION REFUND ESTIMATOR
                    </span>
                    <h4 className="font-display font-black text-lg text-slate-900">
                      Estimated Refund: ₹{refund.refundAmount}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      Status: {refund.cancellationStatus} • Clerkage Deduction: ₹{refund.clerkageCharge}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>IRCTC Standard Cancellation Rules Apply</span>
                    <span className="font-mono text-emerald-700 font-black">Net: ₹{refund.refundAmount}</span>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default PnrStatus;
