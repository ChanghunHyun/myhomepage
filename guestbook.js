import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ── Firebase SDK 설정 ──
const firebaseConfig = {
  projectId: "testproject-58547",
  appId: "1:907536442873:web:8fe909257acb4db259c928",
  storageBucket: "testproject-58547.firebasestorage.app",
  apiKey: "AIzaSyDe38roKlVnenos9_Yt_EUhae_I8jprqVI",
  authDomain: "testproject-58547.firebaseapp.com",
  messagingSenderId: "907536442873",
  measurementId: "G-XC4TKLDVDR"
};

// 앱 초기화 및 Firestore 획득
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const guestbookCol = collection(db, "guestbook");

// ── 관리자 비밀번호 설정 ──
// 기본값: admin1234 (아래 해시값은 'admin1234'의 SHA-256 해시입니다)
// 비밀번호를 변경하려면 원하는 비밀번호의 SHA-256 해시값으로 아래 값을 대체하세요.
const ADMIN_PASSWORD_HASH = "c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd4";

// SHA-256 해싱 헬퍼 함수
async function verifyPassword(inputPassword) {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex === ADMIN_PASSWORD_HASH;
}

// ── 상태 전역 변수 ──
let activeDocId = null;
let activeDocData = null;

// ── DOM 요소 ──
const guestbookList = document.getElementById("guestbookList");
const guestbookForm = document.getElementById("guestbookForm");

// 모달 관련 요소
const deleteModal = document.getElementById("deleteModal");
const deletePasswordInput = document.getElementById("deletePassword");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const editModal = document.getElementById("editModal");
const editNicknameInput = document.getElementById("editNickname");
const editMessageInput = document.getElementById("editMessage");
const editPasswordInput = document.getElementById("editPassword");
const confirmEditBtn = document.getElementById("confirmEditBtn");

// ── 방명록 리스트 실시간 조회 (최신순) ──
const q = query(guestbookCol, orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
  if (snapshot.empty) {
    guestbookList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
        아직 방명록이 없습니다. 첫 번째 이야기를 남겨보세요!
      </div>`;
    return;
  }

  let html = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const docId = doc.id;
    
    // 날짜 포맷팅
    let dateStr = "방금 전";
    if (data.timestamp) {
      const date = data.timestamp.toDate();
      dateStr = date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    html += `
      <div class="guestbook-card">
        <div class="guestbook-card-header">
          <span class="guestbook-author">${escapeHtml(data.nickname)}</span>
          <span class="guestbook-date">${dateStr}</span>
        </div>
        <p class="guestbook-message">${escapeHtml(data.message)}</p>
        <div class="guestbook-actions">
          <button class="action-btn edit-btn" data-id="${docId}" data-nickname="${escapeHtml(data.nickname)}" data-message="${escapeHtml(data.message)}">
            ✏️ 수정
          </button>
          <button class="action-btn delete delete-btn" data-id="${docId}">
            🗑️ 삭제
          </button>
        </div>
      </div>
    `;
  });
  guestbookList.innerHTML = html;

  // 이벤트 바인딩
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      activeDocId = e.currentTarget.dataset.id;
      openModal(deleteModal);
      deletePasswordInput.focus();
    });
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      activeDocId = e.currentTarget.dataset.id;
      editNicknameInput.value = e.currentTarget.dataset.nickname;
      editMessageInput.value = e.currentTarget.dataset.message;
      openModal(editModal);
      editPasswordInput.focus();
    });
  });
});

// ── 방명록 등록 ──
guestbookForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const nickname = document.getElementById("nickname").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!nickname || !message) return;

  try {
    await addDoc(guestbookCol, {
      nickname,
      message,
      timestamp: serverTimestamp()
    });
    guestbookForm.reset();
  } catch (error) {
    console.error("방명록 등록 에러:", error);
    alert("방명록 등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
  }
});

// ── 관리자 삭제 실행 ──
confirmDeleteBtn.addEventListener("click", async () => {
  const password = deletePasswordInput.value;
  if (!password) {
    alert("비밀번호를 입력해 주세요.");
    return;
  }

  const isValid = await verifyPassword(password);
  if (!isValid) {
    alert("관리자 비밀번호가 일치하지 않습니다.");
    deletePasswordInput.value = "";
    deletePasswordInput.focus();
    return;
  }

  try {
    await deleteDoc(doc(db, "guestbook", activeDocId));
    closeModal(deleteModal);
    alert("방명록이 삭제되었습니다.");
  } catch (error) {
    console.error("방명록 삭제 에러:", error);
    alert("삭제 권한이 없거나 오류가 발생했습니다.");
  }
});

// ── 관리자 수정 실행 ──
confirmEditBtn.addEventListener("click", async () => {
  const nickname = editNicknameInput.value.trim();
  const message = editMessageInput.value.trim();
  const password = editPasswordInput.value;

  if (!nickname || !message) {
    alert("이름과 내용을 입력해 주세요.");
    return;
  }
  if (!password) {
    alert("관리자 비밀번호를 입력해 주세요.");
    return;
  }

  const isValid = await verifyPassword(password);
  if (!isValid) {
    alert("관리자 비밀번호가 일치하지 않습니다.");
    editPasswordInput.value = "";
    editPasswordInput.focus();
    return;
  }

  try {
    await updateDoc(doc(db, "guestbook", activeDocId), {
      nickname,
      message
    });
    closeModal(editModal);
    alert("방명록이 성공적으로 수정되었습니다.");
  } catch (error) {
    console.error("방명록 수정 에러:", error);
    alert("수정 권한이 없거나 오류가 발생했습니다.");
  }
});

// ── 모달 컨트롤 헬퍼 ──
function openModal(modalEl) {
  modalEl.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modalEl) {
  modalEl.classList.remove("active");
  document.body.style.overflow = "";
  // 입력 필드 초기화
  const pwInput = modalEl.querySelector('input[type="password"]');
  if (pwInput) pwInput.value = "";
  activeDocId = null;
}

// 모달 닫기 이벤트 리스너 바인딩
document.getElementById("closeDeleteModal").addEventListener("click", () => closeModal(deleteModal));
document.getElementById("cancelDeleteBtn").addEventListener("click", () => closeModal(deleteModal));
document.getElementById("closeEditModal").addEventListener("click", () => closeModal(editModal));
document.getElementById("cancelEditBtn").addEventListener("click", () => closeModal(editModal));

// 모달 외부 영역 클릭 시 닫기
window.addEventListener("click", (e) => {
  if (e.target === deleteModal) closeModal(deleteModal);
  if (e.target === editModal) closeModal(editModal);
});

// ── XSS 방지 escape HTML 헬퍼 ──
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
