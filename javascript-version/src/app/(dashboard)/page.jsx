"use client";

// このページは既存の静的HTML (public/parts-inventory/部品在庫管理.html) をそのまま iframe で表示します。
// もし将来 React 化したい場合は、この iframe を外し HTML/JS をコンポーネントへ段階移行してください。

const IframePage = () => {
    // レイアウト側で付与されている上部パディング/マージンを打ち消して余白を詰める
    // (必要に応じて値を微調整: -24px -> -16px など)
    return (
        <div
            style={{
                height: '90%',
                minHeight: '100vh', // 以前の calc(1vh - 2rem) は 1vh になっていたため修正
                display: 'flex',
                flexDirection: 'column',
                marginTop: '-24px', // 上余白を詰める
            }}
        >
            <div
                style={{
                    flex: 1,
                    borderRadius: 0,
                    overflow: 'hidden',
                }}
            >
                <iframe
                    title="トップページ"
                        src="/top/トップページ.html"
                    style={{ width: '100%', height: '100%', border: 0 }}
                    // allow-forms を追加し、iframe サンドボックス内での form submit (onsubmit ハンドラ含む) を許可
                    // これが無いと sandbox 制約で submit がブロックされ、モーダル内の「作成」「保存」等ボタンが無反応に見える
                    sandbox="allow-scripts allow-same-origin allow-popups allow-downloads allow-forms"
                />
            </div>
        </div>
    );
};

export default IframePage;
