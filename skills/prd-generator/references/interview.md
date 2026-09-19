# Interview Reference

Gather PRD inputs through warm, one-round-at-a-time conversation. Every answer
needs evidence: either the user said it, or the codebase proves it.

## Rules

- Ask in rounds of at most 4 questions (`AskUserQuestion` limit), grouped by
  phase below. Within a round, put the hardest/most-open question last.
- Open-ended questions (description, pain points, feature lists) work badly as
  multiple choice — ask those in chat as free text, or offer the choice plus a
  clear "Other"/"Tulis sendiri" escape hatch.
- Acknowledge each round's answers in one line before the next round.
- Pre-filled answers still get shown for confirmation — never assume silently.
- Follow up when an answer is vague ("app buat toko" → toko apa? jualan apa?).
- Do not skip a question that has no evidence behind it.
- Stop and tell the user when the idea is still too thin to spec: one or two
  answers of substance beats sixteen forced ones.

## Phase 0 — Pre-fill from an existing codebase

When the target already has code, mine it before asking anything.

| Signal to read | Pre-fills |
|----------------|-----------|
| `package.json` / `pyproject.toml` / `Gemfile` / `go.mod` deps + scripts | Q13 tech stack, Q14 realistic timeline, part of Q3 |
| `README*`, first heading and paragraphs | Q1 name, Q3 description, Q4 problem |
| Source tree layout (`src/`, routes, pages, models, migrations) | Q10 core features, Q2 project type |
| Data models / schema files | Q10 features, Q7 user roles |
| Auth middleware, roles, guards | Q7 target users, Q8 user count hint |
| Tests, CI config, lint config | Q15 success metrics, "definition of done" |
| `TODO`/`FIXME` comments, open issues, git log subjects | Q11 nice-to-have, Q12 out-of-scope candidates |
| Existing `PRD.md` or `docs/` | every question — switch to `revise.md` instead |

Then present a compact draft:

> "Gua udah baca repo-nya. Kira-kira ini <nama>, tipe <web/mobile>, fiturnya
> <A, B, C>, user-nya <role>. Bener? Yang belum ketahuan cuma: masalah yang
> mau diatasi, target selesai, dan metrik sukses."

Ask only the remaining gaps, in one round.

## Question Flow

### Round 1 — Dasar project

1. **Project name** — "Apa nama aplikasinya?"
   *Contoh: "TokoKu", "KasirApp"*
2. **Project type** — "Jenisnya apa?"
   Pilihan: Website (browser) / Mobile app (HP) / Desktop app / Web + mobile
   *Contoh: "Mobile doang"*
3. **Target users** — "Siapa yang bakal pakai? Sebutin semua role."
   Tanya juga: umurnya sekitar berapa, paham teknologi atau nggak.
   *Contoh: "Pemilik toko jadi admin, 2 kasir, pelanggan cuma lihat riwayat"*
4. **Description** (free text) — "Ceritain dong, aplikasi ini ngapain?
   Se-detail mungkin."
   *Contoh: "Bantu toko kelontong catat penjualan harian, kelola stok, dan
   bikin laporan bulanan otomatis"*

### Round 2 — Masalah & konteks

5. **Problem statement** — "Masalah apa yang mau diselesaikan? Kenapa butuh
   ini?"
   *Contoh: "Catat penjualan di buku tulis, sering ilang, laporan jadi lama"*
6. **Current workaround** — "Sekarang diatasi gimana? Manual? Pakai Excel?
   Pakai aplikasi lain?"
   *Contoh: "Excel tapi ribet, sering lupa nyatet"*
7. **Why now** — "Kenapa baru bikin sekarang? Ada pemicunya?"
   *Contoh: "Pelanggan nambah, nggak sanggup manual lagi"*
8. **Pain points** (free text) — "Keluhan paling sering dari user soal cara
   kerja sekarang apa?"
   *Contoh: "Kasir salah kembalian, pemilik nggak tau stok habis"*

### Round 3 — Fitur & scope

9. **User count** — "Estimasi berapa orang yang pakai? 10? 100? 1000?"
   *Contoh: "1 pemilik + 2 kasir dulu"*
10. **Core features** (free text) — "Fitur yang WAJIB ada apa aja?
    Minimal 3-5."
    *Contoh: "Catat penjualan, kelola produk, cetak struk, laporan harian"*
11. **Nice-to-have** — "Yang enak kalau ada tapi nggak harus di versi pertama?"
    *Contoh: "Kirim struk lewat WhatsApp"*
12. **Out of scope** — "Yang JANGAN masuk dulu apa? Yang bisa ditunda."
    *Contoh: "Jual online / e-commerce, fase 2 aja"*

### Round 4 — Teknis, waktu, ukuran

13. **Tech stack** — "Ada teknologi yang mau dipake, atau serahin ke AI?"
    Pilihan: "Suggest the best" / stack yang sudah ada di repo / stack tertentu
14. **Timeline** — "Target selesai kapan? Ada deadline?"
    Pilihan: 1 bulan / 3 bulan / 6 bulan / belum tau
15. **Success metrics** — "Gimana tau ini berhasil? Apa yang berubah setelah
    dipakai?"
    *Contoh: "Laporan kelar 5 menit, nggak ada lagi catetan ilang"*
16. **Output language** — "PRD-nya Bahasa Indonesia atau English?"

### Round 5 — Kondisional (skip total kalau nggak ada pemicunya)

Don't run this round by default. Ask only the questions whose trigger matches
what the user said or the repo shows, and say nothing about the ones you skip.

| # | Ask when triggered by | Feeds |
|---|----------------------|-------|
| 17. **Business model** — "Ini bikin duit gimana? Gratis, langganan, komisi per transaksi?" | the app charges, bills, or takes a cut | *Business Model* section, and payment scope in Q10 |
| 18. **Data & compliance** — "Data siapa yang disimpen? Ada NIK/foto/alamat? Boleh ke cloud luar negeri?" | personal data, documents, or health/financial records | *Compliance* section + a Risks row |
| 19. **Integrations** — "Harus nyambung ke apa? Payment gateway, WhatsApp API, marketplace, mesin EDC?" | any third-party system named or implied | *Technical Requirements* dependencies, and a likely P0 feature |
| 20. **Maintenance** — "Habis launch siapa yang benerin kalau mati? Ada budget bulanan?" | the user isn't the operator, or other people will depend on it | *Maintenance* section + a definition-of-done line in Timeline |

If a trigger fires but the answer comes back "belum tau", record it under *Open
Questions* rather than pushing — an unknown is allowed, a missing section isn't.

## Completion Criteria

- Questions 1-16 answered, each either from the user or backed by repo evidence
  the user confirmed; Round 5 only where its trigger fired.
- Features split into P0 / P1 / out-of-scope.
- Output language chosen.
- User says they're ready to generate — then load `generate.md`.
