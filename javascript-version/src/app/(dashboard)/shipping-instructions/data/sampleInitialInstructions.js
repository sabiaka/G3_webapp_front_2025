// サンプルデータ
export const initialInstructions = [
    {
        id: 1,
        title: '木枠',
        line: 'マット',
        completed: false,
        remarks: '西川仕様・至急',
        color: 'GM/BE',
        shippingMethod: '匠',
        destination: 'ホテル',
        note: '両面張り',
        quantity: 1,
    },
    {
        id: 2,
        title: 'マット 1200x1950x200 平 gm/be 1.9 路線 グリーン ホテル仕上',
        line: 'マット',
        completed: true,
        remarks: 'グリーン',
        color: 'GM/BE',
        shippingMethod: '路線',
        destination: 'ホテル',
        note: 'ホテル仕上',
        quantity: 2,
    },
    {
        id: 3,
        title: 'サポート 80巾 5col 福岡県小郡 アマゾン アマゾン直送便',
        line: 'ボトム',
        completed: false,
        remarks: 'アマゾン直送',
        color: '',
        shippingMethod: 'アマゾン直送便',
        destination: '福岡県小郡',
        note: '',
        quantity: 1,
    },
    {
        id: 4,
        title: 'ピロー スタンダード white 保証書 路線 サンプル出荷',
        line: 'その他',
        completed: false,
        remarks: 'サンプル出荷',
        color: 'white',
        shippingMethod: '路線',
        destination: '',
        note: '保証書',
        quantity: 5,
    },
]

export const lineOptions = [
    { value: 'すべて', label: 'すべて' },
    { value: 'マット', label: 'マット' },
    { value: 'ボトム', label: 'ボトム' },
    { value: 'その他', label: 'その他' },
]

export const completedOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'completed', label: '完了' },
    { value: 'not-completed', label: '未完了' },
]
