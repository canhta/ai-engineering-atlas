# Vietnamese style

Rules for every Vietnamese string in this repository: site UI (`site/src/i18n/vi.json`), content labels (`curriculum/presentation.yaml`, `curriculum/manifest.yaml`), and reviewed route translations (`competency.vi.yaml`).

Based on the Microsoft Vietnamese Localization Style Guide, adapted for a developer audience. Where the two differ, this file wins; the differences are marked **(atlas)**. The repository owner reviews Vietnamese before merge.

## Voice

Write the way a Vietnamese developer explains something to a colleague: **short, plain, direct**.

- Rewrite from the intent of the whole screen or paragraph, never string by string. Split, merge, or drop words when that reads more naturally. A string that reads like a translation is wrong even if every word is correct.
- Address the learner as **bạn**. Refer to the site as nothing, or **chúng tôi** only when an action is ours ("chúng tôi không lưu câu trả lời của bạn").
- Prefer sentence fragments for labels, hints, and status: "Nếu còn lỗi", not "Nếu bạn vẫn còn gặp lỗi".
- Use the everyday two-syllable word over the formal or Sino-Vietnamese one. Keep the tone neutral and factual; no jokes, slang, or exclamation marks.
- Northern (Hà Nội) standard spelling and words: **gửi**, **chọn** (not gởi, lựa).

## Terms

**(atlas)** Keep the English terms Vietnamese developers use: AI engineering, deep learning, data engineering, LLM, agent, lab, test, debug, code, link, file, repo, production, prompt, token, commit. The Microsoft guide's "tệp", "ứng dụng", "thiết đặt" suit consumer software, not this audience.

Glossary (use exactly these):

| English                     | Vietnamese                           |
| --------------------------- | ------------------------------------ |
| competency                  | kỹ năng                              |
| ready route                 | lộ trình sẵn sàng / có lộ trình      |
| mapped, no route (coverage) | chưa có lộ trình                     |
| diagnostic                  | kiểm tra đầu vào                     |
| pass condition              | tiêu chí đạt                         |
| sources, learning route     | tài liệu (cần đọc)                   |
| exit evidence               | bằng chứng hoàn thành                |
| transfer                    | vận dụng                             |
| field log                   | nhật ký học                          |
| review (delayed retrieval)  | ôn / ôn tập                          |
| unassessed · gap · learning | chưa đánh giá · còn thiếu · đang học |
| demonstrated · transferred  | đã làm được · vận dụng được          |
| retained · applied          | nhớ lâu · dùng trong dự án           |

Word choice:

| Use                                                 | Not                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| hủy, nhập, ẩn, tìm hiểu, ID                         | hủy bỏ, nhập vào, giấu, học (for "learn about"), mã định danh      |
| chọn, bấm (for UI actions)                          | nhấp, click                                                        |
| Xin chờ                                             | Vui lòng đợi                                                       |
| Không tải được / Không lưu được                     | Tải về không thành công / Lưu thất bại                             |
| sửa, đổi, dùng, chạy, dừng, tìm                     | khắc phục, sửa đổi, sử dụng/tận dụng, thực thi, tạm ngưng, định vị |
| xóa (delete) vs loại bỏ (remove) vs bỏ chọn (clear) | one word for all three                                             |

Acronyms (API, RAG, CSV, URL) stay in English and are never replaced by a Vietnamese acronym. Product and trademark names stay in English. Don't repeat the acronym's own noun unless Vietnamese needs it ("giao thức HTTP" is fine).

## Grammar

- Word order is noun → modifier: "Tài khoản Internet", "kỹ năng chưa có lộ trình". Check that a moved adjective does not change meaning (điểm yếu ≠ yếu điểm).
- Leave out articles and "việc" before verbs used as nouns: "Đọc tài liệu trước", not "Việc đọc tài liệu".
- Use tense words (đã, đang, sẽ) only when the time matters. Pick the negation by meaning: **không** (not), **chưa** (not yet: "chưa có lộ trình", "chưa dịch").
- Imperatives: bare verb on buttons and labels ("Ghi bằng chứng"); **hãy** only in a full instruction sentence where it helps; **vui lòng** only when the learner must fix something.
- Use "các" for a definite plural only when the plural matters; bare nouns usually read better.
- Prepositions: "trên trang", "trên GitHub", "kết nối với", "cập nhật lên", "đổi sang".

## Gender-neutral and inclusive

- Generic people are **bạn**, **người học**, or a role (người đánh giá). If a pronoun is unavoidable use **họ**, never anh ấy / cô ấy or "anh/chị".
- Don't mention disability unless relevant. Instructions work for every input method: **chọn**, not nhấp.
- Spell out **và**, **cộng**, **khoảng**; screen readers misread `&`, `+`, `~`.

## UI text

- Capitalize only the first word and proper nouns, even when the English is Title Case: "Chọn tất cả", "Ghi bằng chứng", "Việt Nam".
- Buttons and menu items: a verb and its object, no ending period. Keep the same verb for an action and its result ("Xuất file" → "Đã xuất file").
- Error messages: declarative, one standard phrase per meaning, ending with a period. **Không tìm thấy …**, **Không … được** (Không nhập được file.), **Không đủ …**, **Có lỗi.** Always "lỗi" for error. Then say what to do.
- Placeholders (`{count}`, `{date}`) must read correctly with any value; put them where Vietnamese syntax puts them, not where English does.

## Punctuation and numbers

- No space before `. , : ; ? ! ) ] ”`; one space after. No space inside parentheses.
- No comma before **và** or **hoặc**.
- Colon: no space before, one after; a list inside a sentence continues in lowercase.
- No hyphens to join words ("dễ dùng", "từ trái sang phải"). En dash for ranges ("2–5 phút"); em dash sparingly.
- Numbers: `1.526` for thousands, `5,25` for decimals, a space before a unit (`250 MB`), none before `%` (`80%`). Format numbers in code with `Intl.NumberFormat("vi-VN")`, not by hand.
- **(atlas)** Dates shown to learners use `dd/mm/yyyy` or "22 tháng 9, 2026"; ISO dates only inside files (`progress.yaml`).

## Checks

`pnpm run check:i18n` (site) enforces, on `vi.json` and on every `vi` value in `site/src/data/atlas.json`:

- keys and `{params}` match English, and a `vi` value is at most 1.3 × its English length + 12 characters;
- no space before punctuation, no comma before và/hoặc, no `&`/`+`/`~` as words;
- none of these words: hủy bỏ, nhập vào, giấu, mã định danh, nhấp, click, Vui lòng đợi, thất bại, không thành công, gởi, anh ấy, cô ấy, anh ta, cô ta.

Everything else in this file is for the writer and the reviewer: voice, word order, and whether the sentence sounds like a Vietnamese developer wrote it.
