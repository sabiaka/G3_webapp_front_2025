// 画像検査ステータスカード: 良品率の円グラフ表示 (セクション切替機能付き)

"use client";

// --- ▼ Reactフックを追加 ▼ ---
import { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// --- ▼ 切り替えボタン用のコンポーネントをインポート ▼ ---
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip'; // Tooltipのインポート

import Link from "@/components/Link";

const headerMinHeight = 80;

// セクションコードから日本語の表示名に変換
const getSectionName = (code) => {
  switch (code) {
    case 'spring':
      return 'バネどめ機';
    case 'alayer':
      return 'A層検査';
    default:
      return code;
  }
};

const ImageInspectionStatusCard = () => {
  // --- ▼ Stateを定義 ▼ ---
  const [inspectionData, setInspectionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- ▼ 新しいState: 現在選択中のセクションを管理 ▼ ---
  // (初期値は 'spring' = バネどめ機)
  const [currentSection, setCurrentSection] = useState('spring');

  // --- ▼ トグルボタンが押された時の処理 ▼ ---
  const handleSectionChange = (event, newSection) => {
    // ボタンが何も選択されなくなるのを防ぐ
    if (newSection !== null) {
      setCurrentSection(newSection);
    }
  };

  // --- ▼ APIからデータを取得 (useEffect) ▼ ---
  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true); // データを取得開始時にローディング中にする
      setError(null);
      try {
        // ★変更点: URLを state の `currentSection` から動的に構築★
        const res = await fetch(`/api/inspections/summary?section=${currentSection}`);
        
        if (!res.ok) {
          throw new Error('検査ステータスの取得に失敗');
        }
        
        const data = await res.json();
        setInspectionData(data);

      } catch (err) {
        console.error(err);
        setError(err.message);
        setInspectionData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatus();
    
  // ★変更点: `currentSection` が変わるたびにこの処理を実行する★
  }, [currentSection]); 


  // --- ▼ ローディング・エラー・成功時で表示を分ける ▼ ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
          <Typography>読み込み中...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
          <Typography color="error" variant="body2">{error}</Typography>
        </Box>
      );
    }
    
    if (!inspectionData || inspectionData.total_count === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
          <Typography color="text.secondary">本日の検査データはありません</Typography>
        </Box>
      );
    }

    // データ取得成功時の表示
    const goodRate = inspectionData.pass_rate;

    return (
      <Box display="flex" alignItems="center" justifyContent="center" gap={2.5}>
        <Box position="relative" width={120} height={120}>
          <svg viewBox="0 0 36 36" width="120" height="120">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--mui-palette-action-disabledBackground)"
              strokeWidth="3"
            />
            <path
              strokeDasharray={`${goodRate}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--mui-palette-info-main)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <Typography variant="h5" fontWeight={700}>{goodRate}%</Typography>
            <Typography variant="caption">良品率</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="body1">検査総数: {inspectionData.total_count.toLocaleString()}</Typography>
          <Typography variant="body1" color="info.main" fontWeight={700}>良品: {inspectionData.pass_count.toLocaleString()}</Typography>
          <Typography variant="body1" color="error.main" fontWeight={700}>不良: {inspectionData.fail_count.toLocaleString()}</Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- ▼ CardHeader に subheader と action (切替ボタン) を追加 ▼ --- */}
      <CardHeader
        title="画像検査ステータス"
        subheader={getSectionName(currentSection)} // 選択中のセクション名を表示
        action={
          <Tooltip title="表示セクション切り替え">
            <ToggleButtonGroup
              value={currentSection}
              exclusive
              onChange={handleSectionChange}
              aria-label="セクション切り替え"
              size="small"
              sx={{ 
                // CardHeaderのpaddingに負けないようにマージン調整
                mr: 1 
              }} 
            >
              <ToggleButton value="spring" aria-label="バネどめ機">
                バネ
              </ToggleButton>
              <ToggleButton value="alayer" aria-label="A層検査">
                A層
              </ToggleButton>
            </ToggleButtonGroup>
          </Tooltip>
        }
        sx={{ minHeight: headerMinHeight }}
      />
      {/* --- ▲ CardHeader 修正 ▲ --- */}

      {/* --- ▼ CardActionArea の href を修正 ▼ --- */}
      <CardActionArea 
        component={Link} 
        href="/image-inspection" // ★変更点: 常に画像検査ページに飛ぶよう固定
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch',
          // CardHeader の分、高さを調整
          flexGrow: 1 
        }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          {renderContent()}
        </CardContent>
      </CardActionArea>
      {/* --- ▲ CardActionArea 修正 ▲ --- */}
    </Card>
  );
};

export default ImageInspectionStatusCard;