'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, QrCode, Wind, ThermometerSun } from 'lucide-react';
import { getAllTables } from '@/app/actions/tables';
import { upsertTable, deleteTable } from '@/app/actions/admin-management';

export default function AdminTables() {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: 4, location: 'AC' });

    const loadData = async () => {
        setLoading(true);
        const data = await getAllTables();
        // Sort by table number (numeric wise if possible)
        data.sort((a: any, b: any) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
        setTables(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddTable = () => {
        setTableForm({ tableNumber: '', capacity: 4, location: 'AC' });
        setShowModal(true);
    };

    const handleSaveTable = async () => {
        if (!tableForm.tableNumber) return;
        setLoading(true);
        const res = await upsertTable({
            tableNumber: tableForm.tableNumber,
            capacity: tableForm.capacity,
            location: tableForm.location
        });

        if (!res.success) alert(res.error);

        await loadData();
        setShowModal(false);
        setLoading(false);
    };

    const handleDeleteTable = async (id: string, number: string) => {
        if (!confirm(`Are you sure you want to delete Table ${number}? This can disrupt active sessions.`)) return;
        setLoading(true);
        await deleteTable(id);
        await loadData();
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Table Management</h2>
                <button onClick={handleAddTable} className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Table
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables.map(table => (
                    <div key={table.id} className="bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center relative group hover:border-slate-300">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleDeleteTable(table.id, table.tableNumber)}
                                className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                                title="Delete Table"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-3">
                            <span className="font-bold text-lg">{table.tableNumber}</span>
                        </div>

                        <div className="text-center w-full">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capacity</div>
                            <div className="font-medium text-slate-900 mb-2">{table.capacity} Persons</div>

                            {table.location && (
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${table.location === 'AC' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {table.location === 'AC' ? <Wind className="w-3 h-3" /> : <ThermometerSun className="w-3 h-3" />}
                                    {table.location === 'AC' ? 'AC' : 'Non-AC'}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 w-full flex justify-center text-slate-400">
                            <QrCode className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full animate-fade-in">
                        <h3 className="font-bold text-lg mb-4">Add New Table</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Table Number</label>
                                <input
                                    value={tableForm.tableNumber}
                                    onChange={e => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                                    placeholder="e.g. 10"
                                    className="input w-full"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Seating Capacity</label>
                                <input
                                    type="number"
                                    value={tableForm.capacity}
                                    onChange={e => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 0 })}
                                    className="input w-full"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Location Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${tableForm.location === 'AC' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                        <input
                                            type="radio"
                                            name="location"
                                            value="AC"
                                            checked={tableForm.location === 'AC'}
                                            onChange={e => setTableForm({ ...tableForm, location: e.target.value })}
                                            className="hidden"
                                        />
                                        <Wind className="w-5 h-5" />
                                        <span className="text-sm font-bold">AC</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${tableForm.location === 'NON_AC' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                        <input
                                            type="radio"
                                            name="location"
                                            value="NON_AC"
                                            checked={tableForm.location === 'NON_AC'}
                                            onChange={e => setTableForm({ ...tableForm, location: e.target.value })}
                                            className="hidden"
                                        />
                                        <ThermometerSun className="w-5 h-5" />
                                        <span className="text-sm font-bold">Non-AC</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-6">
                            <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSaveTable} className="btn btn-primary">Add Table</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
