# WordHub 后端对接文档索引

这组文档是给后端同学的完整交接包，目标是让后端快速理解：

- 前端当前已经做了什么
- 后端需要接什么接口
- 返回数据结构要长什么样
- 词汇分类、风格映射、prompt 生成应该按什么规则做
- 如果时间有限，应该先接哪一部分

建议发送顺序：

1. [01-需要发给后端的文件清单.md](./01-%E9%9C%80%E8%A6%81%E5%8F%91%E7%BB%99%E5%90%8E%E7%AB%AF%E7%9A%84%E6%96%87%E4%BB%B6%E6%B8%85%E5%8D%95.md)
2. [02-接口文档.md](./02-%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3.md)
3. [03-数据结构文档.md](./03-%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E6%96%87%E6%A1%A3.md)
4. [04-模型规则与简短提示词.md](./04-%E6%A8%A1%E5%9E%8B%E8%A7%84%E5%88%99%E4%B8%8E%E7%AE%80%E7%9F%AD%E6%8F%90%E7%A4%BA%E8%AF%8D.md)
5. [05-对接顺序.md](./05-%E5%AF%B9%E6%8E%A5%E9%A1%BA%E5%BA%8F.md)
6. [06-可直接发给后端的消息模板.md](./06-%E5%8F%AF%E7%9B%B4%E6%8E%A5%E5%8F%91%E7%BB%99%E5%90%8E%E7%AB%AF%E7%9A%84%E6%B6%88%E6%81%AF%E6%A8%A1%E6%9D%BF.md)

当前项目真实参考文件：

- 前端查询页：`uni-preset-vue-vite/src/pages/index/index.vue`
- 前端结果页：`uni-preset-vue-vite/src/pages/results/index.vue`
- 前端复习页：`uni-preset-vue-vite/src/pages/review/index.vue`
- 前端本地 mock 与数据结构：`uni-preset-vue-vite/src/utils/wordhub-store.js`
- 词汇分类与风格规则：`codex-skills/word-image-styler/`

一句话原则：

- 运行时的分类、风格映射、prompt 拼装、模型调用，要放后端。
- 前端保留输入、加载动画、结果展示、复习交互。
- 这组文档的用途是让前后端对齐规则，不是让前端继续本地生图。
