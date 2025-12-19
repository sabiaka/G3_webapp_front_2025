"use client";

import { useState } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import ReportFilter from './components/ReportFilter';
import ReportList from './components/ReportList';
import ReportModal from './components/ReportModal';

// サンプル日報データ
const sampleReports = [
	{
		id: 1,
		user: '山田 太郎',
		date: '2024-07-08',
		product: '製品A-102',
		result: '1,050 個',
		work: '組立作業。途中、部品B-5の供給が遅れるトラブルがあったが、他ラインの協力により30分で復旧した。',
		avatarColor: '#a3a8e6',
		avatarText: 'YT',
	},
	{
		id: 2,
		user: '佐藤 花子',
		date: '2024-07-08',
		product: '製品C-301',
		result: '800 個',
		work: '一次塗装を担当。塗料の粘度調整に時間を要したが、マニュアル通りの品質を確保。',
		avatarColor: '#e6a3c8',
		avatarText: 'SH',
	},
	{
		id: 3,
		user: '鈴木 一郎',
		date: '2024-07-08',
		product: '製品A-102',
		result: '1,040 / 1,050 (良品/検査数)',
		work: '検査機#1のエラー対応。センサーの汚れが原因と判明し、清掃後は正常に稼働。',
		avatarColor: '#a3e6c8',
		avatarText: 'SI',
	},
];

function formatDateJP(dateStr) {
  const date = new Date(dateStr);
  const youbi = ['日', '月', '火', '水', '木', '金', '土'];

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${youbi[date.getDay()]})`;
}

export default function DailyReportsPage() {
  const [searchUser, setSearchUser] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    user: '山田 太郎',
    date: new Date().toISOString().slice(0, 10),
    product: '',
    result: '',
    work: '',
    memo: '',
  });

  const filteredReports = sampleReports.filter(report =>
    (!searchUser || report.user.includes(searchUser)) &&
    (!searchDate || report.date === searchDate) &&
    (!searchProduct || report.product.includes(searchProduct)),
  );

  const handleFilterChange = (field, value) => {
    if (field === 'searchUser') setSearchUser(value);
    if (field === 'searchDate') setSearchDate(value);
    if (field === 'searchProduct') setSearchProduct(value);
  };

  const handleFormChange = (field, value) => {
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const handleModalOpen = () => {
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
  };

  const handleModalSave = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4, lg: 6 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <ReportFilter
        searchUser={searchUser}
        searchDate={searchDate}
        searchProduct={searchProduct}
        onChange={handleFilterChange}
      />

      <ReportList reports={filteredReports} dateFormatter={formatDateJP} />

      <IconButton
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: 'primary.main',
          color: '#fff',
          width: 64,
          height: 64,
          boxShadow: 6,
          '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.08)' },
          zIndex: 1200,
        }}
        onClick={handleModalOpen}
        size="large"
        aria-label="日報追加"
      >
        <AddIcon sx={{ fontSize: 36 }} />
      </IconButton>

      <ReportModal
        open={open}
        form={form}
        onChange={handleFormChange}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </Box>
  );
}
