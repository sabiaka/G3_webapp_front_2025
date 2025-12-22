"use client";

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import ReportFilter from './components/ReportFilter';
import ReportList from './components/ReportList';
import ReportModal from './components/ReportModal';
import ReportDetailModal from './components/ReportDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

// ★権限管理フック
import useAuthMe from '@core/hooks/useAuthMe';

export default function DailyReportsPage() {
  // ★ 権限情報を取得
  const { user, isAdmin } = useAuthMe();

  const [uiReports, setUiReports] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // モーダル管理
  const [open, setOpen] = useState(false);             // 登録・編集
  const [detailOpen, setDetailOpen] = useState(false); // 詳細
  const [deleteOpen, setDeleteOpen] = useState(false); // 削除

  // 選択データ管理
  const [selectedReport, setSelectedReport] = useState(null); // 詳細用
  const [deleteTargetId, setDeleteTargetId] = useState(null); // 削除用
  const [editingReport, setEditingReport] = useState(null);   // 編集用

  const [filters, setFilters] = useState({
    employee_name: '',
    date: '',         
    product: ''       
  });
  const [sortOrder, setSortOrder] = useState('date_desc');

  const stringToColor = useCallback((string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }, []);

  // --- 1. データ取得 (GET) ---
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.employee_name) params.set('employee_name', filters.employee_name);
      if (filters.date) params.set('start_date', filters.date);
      if (filters.product) params.set('line_name', filters.product);
      params.set('sort', sortOrder);

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (!res.ok) throw new Error('Fetch failed');

      const rawData = await res.json();
      const dataArray = rawData.reports || (Array.isArray(rawData) ? rawData : []);

      // データ整形
      const formattedData = dataArray.map((item) => ({
        id: item.report_id,
        // ★権限判定のために employee_id が必須
        employee_id: item.employee_id, 
        line_id: item.line_id,
        
        // 表示用データ
        user: item.employee_name,        
        date: item.report_date,
        product: item.line_name,         
        result: '--- 個', 
        work: item.notes || '',          
        avatarColor: stringToColor(item.employee_name || ''), 
        avatarText: (item.employee_name || '??').slice(0, 2)
      }));

      setUiReports(formattedData);
    } catch (error) {
      console.error('取得エラー:', error);
      setUiReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters, sortOrder, stringToColor]);

  // --- 2. 削除処理 (DELETE) ---
  const handleClickDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/reports/${deleteTargetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchReports();
      setDeleteOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  // --- 3. 新規登録 (POST) ---
  const handleAdd = async (formData) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || '登録に失敗しました');
        return;
      }
      await fetchReports();
      setOpen(false); 
    } catch (error) {
      console.error('登録エラー:', error);
      alert('通信エラーが発生しました');
    }
  };

  // --- 4. 更新処理 (PUT) ---
  const handleUpdate = async (formData) => {
    if (!editingReport) return;
    try {
      const res = await fetch(`/api/reports/${editingReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Update failed');
      
      await fetchReports();
      setOpen(false);
      setEditingReport(null);
    } catch (error) {
      alert('更新に失敗しました');
    }
  };

  const handleEditClick = (report) => {
    setEditingReport(report);
    setOpen(true);
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setDetailOpen(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (key === 'searchUser') newFilters.employee_name = value;
      if (key === 'searchDate') newFilters.date = value;
      if (key === 'searchProduct') newFilters.product = value;
      return newFilters;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchReports(), 500);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  return (
    <Box sx={{ p: 3, pb: 10 }}>
      <ReportFilter 
        searchUser={filters.employee_name}
        searchDate={filters.date}
        searchProduct={filters.product}
        sortOrder={sortOrder}
        onChange={handleFilterChange} 
        onSortChange={setSortOrder}
      />

      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>読み込み中...</Box>
      ) : (
        <ReportList 
          reports={uiReports} 
          onDelete={handleClickDelete}
          onViewDetail={handleViewDetail} 
          onEdit={handleEditClick}
          // ★ここで権限情報をリストへ渡す
          currentUser={user}
          isAdmin={isAdmin}
        />
      )}

      <IconButton 
        sx={{ 
          position: 'fixed', bottom: 40, right: 40, zIndex: 1000,
          bgcolor: 'primary.main', color: 'white', 
          '&:hover': { bgcolor: 'primary.dark' },
          width: 64, height: 64, boxShadow: 6
        }}
        onClick={() => {
          setEditingReport(null);
          setOpen(true);
        }}
      >
        <AddIcon sx={{ fontSize: 32 }} />
      </IconButton>

      <ReportModal 
        open={open} 
        onClose={() => { setOpen(false); setEditingReport(null); }} 
        onSubmit={editingReport ? handleUpdate : handleAdd} 
        initialData={editingReport}
      />

      <ReportDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        report={selectedReport}
      />

      <DeleteConfirmModal 
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={executeDelete}
      />
    </Box>
  );
}