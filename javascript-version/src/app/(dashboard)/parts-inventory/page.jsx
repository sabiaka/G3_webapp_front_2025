"use client";

// このページは既存の静的HTML (public/parts-inventory/部品在庫管理.html) をそのまま iframe で表示します。
// もし将来 React 化したい場合は、この iframe を外し HTML/JS をコンポーネントへ段階移行してください。

const IframePage = () => {
    return (
        <div style={{ height: '100%', minHeight: 'calc(1vh - 2rem)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, borderRadius: 8, overflow: 'hidden'}}>
                <iframe
                    title="部品在庫管理"
                    src="/parts-inventory/部品在庫管理.html"
                    style={{ width: '100%', height: '100%', border: '0' }}
                    // sandbox を必要に応じて調整（現状は外部QRコード生成API表示のため allow-same-origin）
                    sandbox="allow-scripts allow-same-origin allow-popups allow-downloads"
                />
            </div>
        </div>
    );
};

export default IframePage;
