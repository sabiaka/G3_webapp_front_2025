'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

export function ErrorLogList({ logs, maxHeight, emptyMessage = '該当するログが見つかりませんでした。' }) {
    return (
        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, ...(maxHeight ? { maxHeight } : {}) }}>
            {logs.length === 0 ? (
                <Box textAlign='center' py={6} color='text.secondary'>
                    <span className='material-icons' style={{ fontSize: 48, color: '#bdbdbd' }}>sentiment_dissatisfied</span>
                    <Typography variant='body1' mt={2}>{emptyMessage}</Typography>
                </Box>
            ) : (
                logs.map((log, idx) => (
                    <Box
                        key={idx}
                        display='flex'
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent='space-between'
                        bgcolor={
                            log.color === 'error' ? 'error.lighter' :
                                log.color === 'warning' ? 'warning.lighter' :
                                    log.color === 'default' ? 'grey.100' : 'info.lighter'
                        }
                        borderRadius={2}
                        px={2}
                        py={1.5}
                        mb={1.5}
                    >
                        <Box pr={2}>
                            <Typography fontWeight='bold' color={
                                log.color === 'error' ? 'error.main' :
                                    log.color === 'warning' ? 'warning.main' :
                                        log.color === 'default' ? 'text.primary' : 'info.main'
                            }>
                                {log.code}: {log.title}
                            </Typography>
                            {log.desc && (
                                <Typography variant='caption' color={
                                    log.color === 'error' ? 'error.dark' :
                                        log.color === 'warning' ? 'warning.dark' :
                                            'text.secondary'
                                }>
                                    {log.desc}
                                </Typography>
                            )}
                            <Box mt={0.5}>
                                <Chip
                                    size='small'
                                    label={log.unitId ? `Unit${log.unitId}` : '全体'}
                                    color={log.unitId ? 'primary' : 'default'}
                                    variant={log.unitId ? 'filled' : 'outlined'}
                                    sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: 11 } }}
                                />
                            </Box>
                        </Box>
                        <Typography variant='body2' color='text.secondary' whiteSpace='nowrap'>
                            {log.date.replace(/-/g, '/')} {log.time}
                        </Typography>
                    </Box>
                ))
            )}
        </Box>
    )
}
