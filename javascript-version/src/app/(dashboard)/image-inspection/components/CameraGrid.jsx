// カメラごとのプレビューと状態をグリッドで並べるレイアウトコンポーネント
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

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
    const isSingleCamera = cameraNames.length === 1
    // 3台のときも2x2(=4枠)で表示するため、ダミー枠を追加
    const needsDummy = !isSingleCamera && cameraNames.length === 3
    const items = needsDummy ? [...cameraNames, '__dummy__'] : cameraNames
    const isTwoCols = items.length >= 4 || items.length === 3 // 3台時も2列に固定

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const dummyImg = `${basePath}/images/pages/CameraNotFound.png`

    return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
            {items.map((name, i) => (
                <Grid
                    item
                    xs={12}
                    sm={isSingleCamera ? 12 : 6}
                    md={isSingleCamera ? 12 : isTwoCols ? 6 : 4}
                    key={i}
                >
                    {name === '__dummy__' ? (
                        <Box
                            sx={{
                                bgcolor: 'grey.900',
                                borderRadius: 2,
                                aspectRatio: '16/9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <img
                                src={dummyImg}
                                alt="placeholder"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Box>
                    ) : (
                        <CameraTile name={name} status={statusByName[name] || 'OK'} isSingle={isSingleCamera} />
                    )}
                </Grid>
            ))}
        </Grid>
    )
}

export default CameraGrid
