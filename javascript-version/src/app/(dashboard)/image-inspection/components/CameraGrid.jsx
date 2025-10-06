import Grid from '@mui/material/Grid'
import CameraTile from './CameraTile'

/**
 * CameraGrid コンポーネント
 * 
 * 複数のカメラ名とそのステータスをグリッドレイアウトで表示します。
 * カメラ数が4以上の場合は2列、3以下の場合は3列で表示します。
 * 各カメラは CameraTile コンポーネントで表現されます。
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string[]} props.cameraNames - 表示するカメラの名前リスト
 * @param {Object.<string, string>} props.statusByName - カメラ名ごとのステータス（例: { "Camera1": "OK", "Camera2": "Error" }）
 * @returns {JSX.Element} グリッドレイアウトでカメラタイルを表示するReact要素
 */

const CameraGrid = ({ cameraNames, statusByName }) => {
    const cols = cameraNames.length >= 4 ? 2 : 3
    return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
            {cameraNames.map((name, i) => (
                <Grid item xs={12} sm={6} md={cols === 3 ? 4 : 6} key={i}>
                    <CameraTile name={name} status={statusByName[name] || 'OK'} />
                </Grid>
            ))}
        </Grid>
    )
}

export default CameraGrid
