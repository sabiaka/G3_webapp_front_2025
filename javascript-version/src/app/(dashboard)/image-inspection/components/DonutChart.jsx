// 検査の良品率を円形ドーナツチャートで視覚化するコンポーネント
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

const DonutChart = ({ percentage, size = 160 }) => {
    const theme = useTheme()
    const radius = (size - 20) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
    const bgStroke = theme.palette.divider
    const fgStroke = theme.palette.success.main

    return (
        <Box sx={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgStroke}
                    strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={fgStroke}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h3" component="div" fontWeight="bold" color="primary">
                    {percentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    良品率
                </Typography>
            </Box>
        </Box>
    )
}

export default DonutChart
