(function () {
  const originalRenderStudent = renderStudent;
  const originalRenderTeacher = renderTeacher;
  const defaultImageUrls = { 1: "VÒNG 1.jpg", 2: "VÒNG 2.jpg" };
  const defaultWordsByRound = {
    1: ["Cầu", "Bàn tay", "Núi", "Đà Nẵng", "Biển", "Sa mạc", "Tuyết", "Xe máy", "Chợ", "Ruộng", "Thuyền", "Phố cổ", "Hoa", "Sân bóng", "Tàu hỏa", "Nhà cao tầng"],
    2: ["Đèn lồng", "Phố cổ", "Sông", "Mái ngói", "Nhà cao tầng", "Tàu điện", "Tuyết", "Sa mạc"],
  };
  const defaultWeights = { "Đèn lồng": "priority", "Phố cổ": "priority" };

  function configuredImageUrl(activity, round) {
    const savedUrl = activity.imageUrls?.[round];
    if (round === 1 && savedUrl?.includes("id=1RQtJBuB20n33hFyzoI7jq4RWI3mzwPzG"))
      return defaultImageUrls[round];
    return savedUrl || defaultImageUrls[round];
  }

  function imageUrl(value) {
    const valueTrimmed = String(value || "").trim();
    if (!valueTrimmed) return "";
    if (/drive\.google\.com\/drive\/folders\//i.test(valueTrimmed)) return "";
    if (!/^[a-z][a-z\d+.-]*:/i.test(valueTrimmed) && !valueTrimmed.startsWith("//"))
      return valueTrimmed;
    const driveId =
      valueTrimmed.match(/drive\.google\.com\/file\/d\/([^/?]+)/)?.[1] ||
      valueTrimmed.match(/[?&]id=([^&]+)/)?.[1];
    if (driveId)
      return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w1600`;
    try {
      const parsed = new URL(valueTrimmed);
      return parsed.protocol === "https:" || parsed.protocol === "http:"
        ? parsed.href
        : "";
    } catch {
      return "";
    }
  }

  function escape(value) {
    return escapeHtml(value);
  }

  function wordsFrom(value) {
    return [
      ...new Set(
        String(value || "")
          .split(/\n|,/)
          .map((word) => word.trim())
          .filter(Boolean),
      ),
    ];
  }

  function settingsFromForm() {
    const weights = {};
    document.querySelectorAll("[data-word-weight]").forEach((select) => {
      if (select.value !== "normal")
        weights[select.dataset.wordWeight] = select.value;
    });
    return {
      imageUrls: {
        1: imageUrl($("activityImage1").value),
        2: imageUrl($("activityImage2").value),
      },
      wordsByRound: {
        1: wordsFrom($("activityWords1").value),
        2: wordsFrom($("activityWords2").value),
      },
      weights,
    };
  }

  function validateSettings(settings, round) {
    if (!settings.imageUrls[round])
      return `Cần nhập liên kết ảnh ${round} hợp lệ.`;
    const words = settings.wordsByRound[round];
    if (words.length < 4) return `Bộ thẻ vòng ${round} cần có ít nhất 4 từ khóa.`;
    if ([1, 2].some((index) => settings.wordsByRound[index].length < 4))
      return "Mỗi vòng cần có ít nhất 4 từ khóa.";
    const roundTwoWords = settings.wordsByRound[2];
    const priority = roundTwoWords.filter(
      (word) => settings.weights[word] === "priority",
    );
    const available = roundTwoWords.filter(
      (word) => settings.weights[word] !== "noise",
    );
    if (priority.length > 4) return "Chỉ đánh dấu tối đa 4 từ khóa bắt buộc.";
    if (available.length < 4)
      return "Cần còn ít nhất 4 từ khóa không bị loại bỏ.";
    if (round === 2 && priority.length === 0)
      return "Trước vòng 2, hãy đánh dấu ít nhất một từ khóa cần ưu tiên.";
    if (!$(`answer${round}`).value.trim())
      return `Hãy nhập đáp án cho ảnh ${round}.`;
    return "";
  }

  function renderWeightControls(words, weights) {
    const host = $("activityWeights");
    if (!host) return;
    host.innerHTML =
      words
        .map(
          (word) => `
      <label class="row" style="justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--line)">
        <span>${escape(word)}</span>
        <select data-word-weight="${escape(word)}" aria-label="Trọng số: ${escape(word)}">
          <option value="normal">Bình thường</option>
          <option value="priority">★ Bắt buộc ưu tiên</option>
          <option value="noise">Loại bỏ ở vòng 2</option>
        </select>
      </label>`,
        )
        .join("") || '<p class="muted">Thêm từ khóa để đặt trọng số.</p>';
    host.querySelectorAll("[data-word-weight]").forEach((select) => {
      select.value = weights[select.dataset.wordWeight] || "normal";
    });
  }

  function ensureTeacherPanel() {
    if ($("activityPanel")) return;
    $("teacher").insertAdjacentHTML(
      "afterbegin",
      `
      <div class="card" id="activityPanel">
        <h3>Thiết lập ảnh và bộ thẻ</h3>
        <p class="muted">Hai ảnh trong workspace đã được nạp sẵn. Khung của học sinh chỉ hiện phần ảnh chính, không lộ bảng đáp án phía dưới.</p>
        <div class="grid2">
          <div class="field"><label for="activityImage1">Ảnh bí mật vòng 1</label><input id="activityImage1" type="text" placeholder="VÒNG 1.jpg"></div>
          <div class="field"><label for="activityImage2">Ảnh vòng 2</label><input id="activityImage2" type="text" placeholder="VÒNG 2.jpg"></div>
        </div>
        <div class="grid2" style="margin-top:12px">
          <div class="field"><label for="activityWords1">Toàn bộ thẻ vòng 1, mỗi dòng một từ</label><textarea id="activityWords1" rows="7"></textarea></div>
          <div class="field"><label for="activityWords2">Toàn bộ thẻ vòng 2, mỗi dòng một từ</label><textarea id="activityWords2" rows="7"></textarea></div>
        </div>
        <div class="field" style="margin-top:12px"><label>Điều chỉnh trọng số cho vòng 2</label><div id="activityWeights"></div></div>
        <div class="bar"><button class="primary" id="saveActivity">Lưu ảnh, bộ thẻ và trọng số</button><span id="activitySaveStatus" class="muted" aria-live="polite"></span></div>
        <p id="activityStageHint" class="muted"></p>
        <img id="activityPreview" class="image hidden" alt="Ảnh của vòng hiện tại">
        <div id="activityPreviewStatus" class="notice">Ảnh vòng hiện tại sẽ hiện ở đây.</div>
      </div>`,
    );

    $("activityWords1").value = defaultWordsByRound[1].join("\n");
    $("activityWords2").value = defaultWordsByRound[2].join("\n");
    renderWeightControls(defaultWordsByRound[2], defaultWeights);
    $("activityWords2").addEventListener("input", () => {
      const currentWeights = {};
      document.querySelectorAll("[data-word-weight]").forEach((select) => {
        if (select.value !== "normal")
          currentWeights[select.dataset.wordWeight] = select.value;
      });
      renderWeightControls(wordsFrom($("activityWords2").value), currentWeights);
    });
    $("saveActivity").onclick = saveSettings;
  }

  function syncTeacherPanel() {
    ensureTeacherPanel();
    const activity = localData?.activity || {};
    const signature = JSON.stringify(activity);
    const panel = $("activityPanel");
    if (panel.dataset.signature !== signature) {
      $("activityImage1").value = configuredImageUrl(activity, 1);
      $("activityImage2").value = configuredImageUrl(activity, 2);
      $("activityWords1").value = (activity.wordsByRound?.[1] || activity.words || defaultWordsByRound[1]).join("\n");
      $("activityWords2").value = (activity.wordsByRound?.[2] || defaultWordsByRound[2]).join("\n");
      renderWeightControls(
        activity.wordsByRound?.[2] || defaultWordsByRound[2],
        activity.weights || defaultWeights,
      );
      panel.dataset.signature = signature;
    }
    const round = currentRound(localData || {});
    const previewUrl = configuredImageUrl(activity, round);
    const preview = $("activityPreview");
    const status = $("activityPreviewStatus");
    preview.classList.toggle("hidden", !previewUrl);
    preview.onerror = () => {
      preview.classList.add("hidden");
      status.textContent =
        "Không tải được ảnh. Kiểm tra liên kết và quyền xem.";
    };
    if (previewUrl) {
      preview.src = previewUrl;
      status.textContent = `Ảnh vòng ${round}${localData?.revealed ? " · đã công bố" : ""}`;
    } else {
      preview.removeAttribute("src");
      status.textContent = `Chưa có liên kết ảnh vòng ${round}.`;
    }
    $("start1").textContent = "▶ Bắt đầu với ảnh 1";
    $("reveal").textContent = "👁 Công bố ảnh và đáp án";
    $("start2").textContent = "▶ Thử lại với ảnh 2";
    $("start1").disabled = !configuredImageUrl(activity, 1);
    $("start2").disabled = !(
      localData?.round === 1 &&
      localData?.revealed &&
      configuredImageUrl(activity, 2) &&
      Object.values(activity.weights || {}).includes("priority")
    );
  }

  async function saveSettings() {
    if (!roomRef) return;
    const settings = settingsFromForm();
    if (settings.wordsByRound[1].length < 4 || settings.wordsByRound[2].length < 4) {
      $("activitySaveStatus").textContent = "Mỗi vòng cần có ít nhất 4 từ khóa.";
      return;
    }
    if (
      settings.wordsByRound[2].filter((word) => settings.weights[word] === "priority")
        .length > 4
    ) {
      $("activitySaveStatus").textContent =
        "Chỉ đánh dấu tối đa 4 từ khóa bắt buộc.";
      return;
    }
    if (
      [1, 2].some(
        (round) =>
          $("activityImage" + round).value.trim() && !settings.imageUrls[round],
      )
    ) {
      $("activitySaveStatus").textContent =
        "Liên kết ảnh không hợp lệ. Dùng URL HTTP(S) của từng tệp ảnh.";
      return;
    }
    await roomRef.update({
      activity: settings,
      answers: { 1: $("answer1").value.trim(), 2: $("answer2").value.trim() },
      updatedAt: Date.now(),
    });
    $("activitySaveStatus").textContent = "Đã lưu cấu hình cho cả phòng.";
  }

  async function startRound(round) {
    const settings = settingsFromForm();
    const error = validateSettings(settings, round);
    if (error) {
      $("activitySaveStatus").textContent = error;
      return;
    }
    if (round === 2 && !(localData?.round === 1 && localData?.revealed)) {
      $("activitySaveStatus").textContent =
        "Hãy hoàn tất vòng 1 và công bố đáp án trước.";
      return;
    }
    const answers = {
      1: $("answer1").value.trim(),
      2: $("answer2").value.trim(),
    };
    await roomRef.update({
      activity: settings,
      round,
      revealed: false,
      answers,
      updatedAt: Date.now(),
    });
    const requiredWords =
      round === 2
        ? settings.wordsByRound[2].filter((word) => settings.weights[word] === "priority")
        : [];
    await roomRef.child("rounds/" + round).set({
      words: requiredWords,
      wordsSent: false,
      clue1: "",
      clue2: "",
      cluesSent: false,
      guess: "",
      guessSent: false,
      feedback: "",
    });
  }

  function renderInputRole() {
    if (!$ ("studentPictureCropStyle")) {
      const style = document.createElement("style");
      style.id = "studentPictureCropStyle";
      style.textContent = ".student-picture-crop{width:min(100%,900px);aspect-ratio:1.52;overflow:hidden;margin:12px auto;border:1px solid var(--line);border-radius:7px;background:#eef2eb}.student-picture-crop img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 15%;margin:0;border:0;border-radius:0}";
      document.head.append(style);
    }
    const round = currentRound(localData || {});
    const activity = localData?.activity || {};
    const words = activity.wordsByRound?.[round]?.length
      ? activity.wordsByRound[round]
      : round === 1 && activity.words?.length
        ? activity.words
        : defaultWordsByRound[round];
    const weights = activity.weights || {};
    const required =
      round === 2 ? words.filter((word) => weights[word] === "priority") : [];
    const deck =
      round === 2 ? words.filter((word) => weights[word] !== "noise") : words;
    const selected = roundData(localData).words || [];
    const url = configuredImageUrl(activity, round);
    const imageBlock = url
      ? `<div class="student-picture-crop"><img id="studentActivityImage" src="${escape(url)}" alt="Ảnh bí mật vòng ${round}"></div>`
      : '<div class="notice warn">Giáo viên chưa cấu hình ảnh cho vòng này.</div>';
    const cards = deck
      .map((word) => {
        const isRequired = required.includes(word);
        const isSelected = selected.includes(word);
        return `<button class="word${isSelected ? " sel" : ""}" data-activity-word="${escape(word)}" ${isRequired ? 'aria-pressed="true"' : ""}><span>${isRequired ? "★" : "🔎"}</span><span>${escape(word)}</span>${isRequired ? "<small>Bắt buộc</small>" : ""}</button>`;
      })
      .join("");
    $("studentTask").innerHTML = `
      <h2>👀 Lớp đầu vào · Vòng ${round}</h2>
      <p class="muted">${round === 1 ? "Quan sát ảnh và chọn 4 thẻ phù hợp nhất." : "Dùng ảnh thứ hai. Các thẻ ★ đã được yêu cầu ưu tiên; thẻ nhiễu đã bị loại."}</p>
      ${imageBlock}
      <div id="activityImageError" class="notice warn hidden">Không tải được ảnh. Báo giáo viên kiểm tra liên kết.</div>
      <div class="wordgrid">${cards}</div>
      <div class="bar"><span class="muted">Đã chọn ${selected.length}/4</span><button class="outline" id="clearActivityWords">Bỏ chọn</button><button class="primary" id="sendActivityWords" ${selected.length !== 4 || required.some((word) => !selected.includes(word)) ? "disabled" : ""}>Chuyển 4 thẻ →</button></div>`;
    const image = $("studentActivityImage");
    if (image)
      image.onerror = () => $("activityImageError").classList.remove("hidden");
    document.querySelectorAll("[data-activity-word]").forEach((button) => {
      button.onclick = async () => {
        const word = button.dataset.activityWord;
        const current = roundData(localData).words || [];
        if (required.includes(word) && current.includes(word)) return;
        const next = current.includes(word)
          ? current.filter((item) => item !== word)
          : current.length < 4
            ? [...current, word]
            : current;
        await rPath().update({ words: next, wordsSent: false });
      };
    });
    $("clearActivityWords").onclick = async () =>
      rPath().update({ words: required, wordsSent: false });
    $("sendActivityWords").onclick = async () => {
      const current = roundData(localData).words || [];
      if (
        current.length === 4 &&
        required.every((word) => current.includes(word))
      ) {
        await rPath().update({ wordsSent: true });
      }
    };
  }

  renderStudent = function () {
    originalRenderStudent();
    if (role === "input" && localData?.round) renderInputRole();
  };

  renderTeacher = function () {
    originalRenderTeacher();
    if (!localData?.answers?.[1] || $("answer1").value === "Cầu Vàng – Bà Nà Hills")
      $("answer1").value = localData?.answers?.[1] || "Cầu Vàng – Bà Nà Hills";
    if (!localData?.answers?.[2] || $("answer2").value === "Bà Nà Hills – Cầu Vàng")
      $("answer2").value = "Hội An";
    syncTeacherPanel();
  };

  $("start1").onclick = () => startRound(1);
  $("start2").onclick = () => startRound(2);
  $("reveal").onclick = async () => {
    if (!localData?.round) {
      $("teacherMsg").textContent = "Hãy bắt đầu một vòng trước.";
      return;
    }
    const answers = {
      1: $("answer1").value.trim(),
      2: $("answer2").value.trim(),
    };
    await roomRef.update({ revealed: true, answers, updatedAt: Date.now() });
  };
  $("resetRoom").onclick = async () => {
    if (confirm("Xóa tiến trình hiện tại của phòng này?")) {
      await roomRef.set({
        round: 0,
        revealed: false,
        answers: { 1: $("answer1").value.trim(), 2: $("answer2").value.trim() },
        rounds: {},
        feedback: "",
        activity: localData?.activity || {},
        updatedAt: Date.now(),
      });
    }
  };
  function weightSignature(weights) {
    return JSON.stringify(
      Object.entries(weights || {}).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    );
  }

  const validateBeforeAdjustment = validateSettings;
  validateSettings = function (settings, round) {
    const error = validateBeforeAdjustment(settings, round);
    if (error) return error;
    if (
      round === 2 &&
      weightSignature(settings.weights) ===
        weightSignature(localData?.rounds?.[1]?.weightsAtStart)
    ) {
      return "Hãy thay đổi ít nhất một trọng số sau khi phân tích vòng 1.";
    }
    return "";
  };

  const syncBeforeAdjustment = syncTeacherPanel;
  syncTeacherPanel = function () {
    syncBeforeAdjustment();
    const changed =
      weightSignature(localData?.activity?.weights) !==
      weightSignature(localData?.rounds?.[1]?.weightsAtStart);
    const hasPriority = Object.values(
      localData?.activity?.weights || {},
    ).includes("priority");
    $("start2").disabled = $("start2").disabled || !changed;
    $("activityStageHint").textContent = !localData?.round
      ? "Bắt đầu bằng ảnh 1 sau khi đã lưu cấu hình."
      : localData.round !== 1
        ? "Làm mới phòng để bắt đầu một lượt hoạt động mới."
        : !localData.revealed
          ? "Sau khi lớp đầu ra chốt đáp án, công bố ảnh và cùng lớp phân tích ngược."
          : !hasPriority
            ? "Đánh dấu ít nhất một từ đặc trưng là bắt buộc ưu tiên."
            : !changed
              ? "Thay đổi trọng số sau khi phân tích rồi lưu để mở ảnh 2."
              : "Đã điều chỉnh trọng số. Có thể bắt đầu với ảnh 2.";
  };

  const startBeforeAdjustment = startRound;
  startRound = async function (round) {
    const settings = settingsFromForm();
    const canStart =
      !validateSettings(settings, round) &&
      (round !== 2 || (localData?.round === 1 && localData?.revealed));
    await startBeforeAdjustment(round);
    if (round === 1 && canStart) {
      await roomRef.child("rounds/1/weightsAtStart").set(settings.weights);
    }
  };
})();
