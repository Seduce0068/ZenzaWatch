# ZenzaWatch

Ginzaから独立して単体で動くHTML5版ニコニコ動画プレイヤーです。
Greasemonkeyスクリプトとして動作します。


## ライセンス

本 fork は `AGPL-3.0-or-later` で公開します（[LICENSE](LICENSE) を参照）。

上流 segabito/ZenzaWatch（https://github.com/segabito/ZenzaWatch）由来のコードには
public domain とする宣言が付されています。本 fork では当該上流の条件を尊重しつつ、
fork 後に加えた変更と配布物の表記を AGPL-3.0-or-later に統一しています。
`packages/components` も上流由来のパッケージですが、本 fork の配布物として
`package.json` の license を AGPL-3.0-or-later に統一しています。


## インストール

[dist](dist/) から `*.user.js` を開き raw ボタンを押すことでインストールできます

## 配布

この fork では `dist/ZenzaWatch-dev.user.js` を開発版、
`dist/ZenzaWatch.user.js` を安定版として配布します。
`@downloadURL` はこの fork の `playlist-deploy` ブランチを指します。

配布先を変える場合はビルド時に上書きできます。

```bash
node build.js --download-base=https://github.com/<owner>/<repo>/raw/<branch>
```

## フィードバック

雑にDiscussionsでコメントしたり、バグの原因がわかってたらIssue開いたり
