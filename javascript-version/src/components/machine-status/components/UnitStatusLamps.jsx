'use client'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const unitLampColorMap = {
    残弾わずか: 'warning',
    残弾なし: 'error',
    正常稼働: 'success',
    エラー: 'error',
    不明: 'default',
    停止中: 'default',
}

export function UnitStatusLamps({ unitStatuses }) {
    return (
        <Box mb={2}>
            <Typography variant='subtitle2' color='text.secondary' mb={1}>
                ユニット ステータス
            </Typography>
            <Grid container spacing={1.5}>
                {['Unit1', 'Unit2', 'Unit3', 'Unit4'].map((unit) => (
                    <Grid item xs={6} key={unit}>
                        <Box
                            display='flex'
                            alignItems='center'
                            justifyContent='flex-start'
                            p={1.25}
                            borderRadius={1.5}
                            sx={{ bgcolor: 'grey.50', border: (theme) => `1px solid ${theme.palette.divider}` }}
                        >
                            <Box display='flex' alignItems='center' gap={1.25}>
                                <Typography variant='body2' fontWeight={600} minWidth={48}>
                                    {unit}
                                </Typography>
                                <Box display='flex' alignItems='center' gap={0.75}>
                                    <Box
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            bgcolor: (theme) =>
                                                theme.palette[unitLampColorMap[unitStatuses[unit]]]?.main || theme.palette.text.disabled,
                                            boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
                                        }}
                                    />
                                    <Typography variant='caption' color='text.secondary'>
                                        {unitStatuses[unit]}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}
