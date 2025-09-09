"use client";

// このページは既存の静的HTML (public/parts-inventory/部品在庫管理.html) をそのまま iframe で表示します。
// もし将来 React 化したい場合は、この iframe を外し HTML/JS をコンポーネントへ段階移行してください。

const IframePage = () => {
    // レイアウト側で付与されている上部パディング/マージンを打ち消して余白を詰める
    // (必要に応じて値を微調整: -24px -> -16px など)
    return (
        <div
            style={{
                height: '100vh',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                marginTop: '-24px',
                overflow: 'hidden', // 親でスクロールバーを出さない
            }}
        >
            <iframe
                title="部品在庫管理"
                src="/production-management/生産数管理ページ.html"
                style={{ width: '100%', height: '100vh', border: 0, display: 'block' }}
                sandbox="allow-scripts allow-same-origin allow-popups allow-downloads allow-forms"
            />
        </div>
    );
};

export default IframePage;
