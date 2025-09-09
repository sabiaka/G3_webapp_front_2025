"use client";
// MUI（Materio）コンポーネントのインポート
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';

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
	// yyyy-mm-dd → yyyy年m月d日 (曜日)
	const date = new Date(dateStr);
	const youbi = ['日', '月', '火', '水', '木', '金', '土'];
	return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${youbi[date.getDay()]})`;
}

export default function DailyReportsPage() {
	// 検索・フィルター用state
	const [searchUser, setSearchUser] = useState('');
	const [searchDate, setSearchDate] = useState('');
	const [searchProduct, setSearchProduct] = useState('');
	// モーダル制御
	const [open, setOpen] = useState(false);

	// 日報追加・編集フォームstate（簡易）
	const [form, setForm] = useState({
		user: '山田 太郎',
		date: new Date().toISOString().slice(0, 10),
		product: '',
		result: '',
		work: '',
		memo: '',
	});

	// 検索フィルター適用
	const filteredReports = sampleReports.filter(r =>
		(!searchUser || r.user.includes(searchUser)) &&
		(!searchDate || r.date === searchDate) &&
		(!searchProduct || r.product.includes(searchProduct))
	);

	return (
		<Box sx={{ p: { xs: 2, sm: 4, lg: 6 }, bgcolor: 'background.default', minHeight: '100vh' }}>
			{/* 検索・フィルターバー */}
			<Card sx={{ mb: 6, borderRadius: 3, boxShadow: 3 }}>
				<CardContent>
					<Grid container spacing={2}>
						<Grid item xs={12} md={6} lg={6}>
							<TextField
								label="担当者"
								value={searchUser}
								onChange={e => setSearchUser(e.target.value)}
								fullWidth
								size="small"
								placeholder="山田 太郎"
								variant="outlined"
							/>
						</Grid>
						<Grid item xs={12} md={3} lg={3}>
							<TextField
								label="日付"
								type="date"
								value={searchDate}
								onChange={e => setSearchDate(e.target.value)}
								fullWidth
								size="small"
								InputLabelProps={{ shrink: true }}
								variant="outlined"
							/>
						</Grid>
						<Grid item xs={12} md={3} lg={3}>
							<TextField
								label="製品名"
								value={searchProduct}
								onChange={e => setSearchProduct(e.target.value)}
								fullWidth
								size="small"
								placeholder="製品A-102"
								variant="outlined"
							/>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{/* 日報リスト */}
			<Grid container spacing={3}>
				{filteredReports.map((report, idx) => (
					<Grid item xs={12} lg={6} xl={4} key={report.id}>
						<Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 8 } }}>
							<CardContent sx={{ flexGrow: 1 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'grey.200' }}>
									<Box sx={{
										width: 48, height: 48, borderRadius: '50%', bgcolor: report.avatarColor, color: '#fff',
										display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 22, mr: 2
									}}>{report.avatarText}</Box>
									<Box>
										<Typography fontWeight="bold" color="text.primary">{report.user}</Typography>
										<Typography variant="body2" color="text.secondary">{formatDateJP(report.date)}</Typography>
									</Box>
								</Box>
								<Box sx={{ fontSize: 15, color: 'text.secondary', mb: 1 }}>
									<strong style={{ width: 60, display: 'inline-block', color: '#6b7280' }}>製品名:</strong> <span style={{ fontWeight: 600 }}>{report.product}</span>
								</Box>
								<Box sx={{ fontSize: 15, color: 'text.secondary', mb: 1 }}>
									<strong style={{ width: 60, display: 'inline-block', color: '#6b7280' }}>生産実績:</strong> <span style={{ fontWeight: 600 }}>{report.result}</span>
								</Box>
								<Box sx={{ mt: 1 }}>
									<strong style={{ color: '#6b7280', marginBottom: 4, display: 'inline-block' }}>作業内容:</strong>
									<Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{report.work}</Typography>
								</Box>
							</CardContent>
							<CardActions sx={{ justifyContent: 'flex-end' }}>
								<Button size="small" color="primary" sx={{ fontWeight: 'bold' }}>詳細を見る &rarr;</Button>
							</CardActions>
						</Card>
					</Grid>
				))}
			</Grid>

			{/* フローティング追加ボタン */}
			<IconButton
				color="primary"
				sx={{
					position: 'fixed', bottom: 32, right: 32, bgcolor: 'primary.main', color: '#fff', width: 64, height: 64, boxShadow: 6,
					'&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.08)' },
					zIndex: 1200
				}}
				onClick={() => setOpen(true)}
				size="large"
				aria-label="日報追加"
			>
				<AddIcon sx={{ fontSize: 36 }} />
			</IconButton>

			{/* 日報追加・編集モーダル */}
			<Modal
				open={open}
				onClose={() => setOpen(false)}
				closeAfterTransition
				slots={{ backdrop: Backdrop }}
				slotProps={{ backdrop: { timeout: 300 } }}
			>
				<Fade in={open}>
					<Box sx={{
						position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
						width: { xs: '95vw', sm: 500 }, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 24,
						p: 4, maxHeight: '90vh', overflowY: 'auto'
					}}>
						<Typography variant="h6" fontWeight="bold" mb={2}>日報入力</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<TextField
									label="担当者"
									value={form.user}
									fullWidth
									size="small"
									InputProps={{ readOnly: true }}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									label="日付"
									type="date"
									value={form.date}
									onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
									fullWidth
									size="small"
									InputLabelProps={{ shrink: true }}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									label="製品名"
									value={form.product}
									onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
									fullWidth
									size="small"
									placeholder="製品A-102"
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									label="生産実績数"
									value={form.result}
									onChange={e => setForm(f => ({ ...f, result: e.target.value }))}
									fullWidth
									size="small"
									placeholder="1050"
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									label="今日の作業内容"
									value={form.work}
									onChange={e => setForm(f => ({ ...f, work: e.target.value }))}
									fullWidth
									size="small"
									multiline
									minRows={4}
									placeholder="箇条書きでOK！\n例：\n・製品A-102の組立\n・部品B-5の供給遅れ（30分ロス）\n・1050個完了"
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									label="メモ"
									value={form.memo}
									onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
									fullWidth
									size="small"
									multiline
									minRows={2}
									placeholder="気づいた点、改善提案など"
								/>
							</Grid>
						</Grid>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
							<Button variant="outlined" color="inherit" onClick={() => setOpen(false)}>
								キャンセル
							</Button>
							<Button variant="contained" color="primary" onClick={() => setOpen(false)}>
								保存
							</Button>
						</Box>
					</Box>
				</Fade>
			</Modal>
		</Box>
	);
}
