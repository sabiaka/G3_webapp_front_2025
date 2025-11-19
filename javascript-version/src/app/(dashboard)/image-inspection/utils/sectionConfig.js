// セクションごとのカメラ構成を集中管理
export const SECTION_CONFIG = {
    'バネ留め': { cameras: ['B-spring01', 'B-spring02', 'B-spring03', 'B-spring04'] },
    'A層': { cameras: ['A-main01'] },
}

export const SECTIONS = Object.keys(SECTION_CONFIG)
