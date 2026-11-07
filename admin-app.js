// Ambil database rilisan dari penyimpanan lokal browser
let releasesDatabase = JSON.parse(localStorage.getItem('ferwap_releases')) || [];

function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  tbody.innerHTML = '';

  if (releasesDatabase.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#828ca0; padding: 24px;">No incoming releases found. Waiting for artist submissions.</td></tr>`;
    return;
  }

  releasesDatabase.forEach(item => {
    const tr = document.createElement('tr');
    const badgeClass = item.status === 'Approved' ? 'badge-approved' : 'badge-pending';
    
    tr.innerHTML = `
      <td><strong>${item.title}</strong></td>
      <td>${item.artist}</td>
      <td><code>${item.upc}</code></td>
      <td><code>${item.isrc}</code></td>
      <td><span class="badge-status ${badgeClass}">${item.status}</span></td>
      <td>
        ${item.status === 'Pending' 
          ? `<button class="btn-approve" onclick="approveRelease(${item.id})">Approve & Deliver</button>` 
          : `<button class="btn-inspect" onclick="inspectXML(${item.id})">View DDEX XML</button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Aksi Menyetujui Rilisan
function approveRelease(id) {
  const item = releasesDatabase.find(r => r.id === id);
  if (item) {
    item.status = 'Approved';
    localStorage.setItem('ferwap_releases', JSON.stringify(releasesDatabase));
    renderAdminTable();
    inspectXML(id);
  }
}

// Lihat XML DDEX ERN 3.8
function inspectXML(id) {
  const item = releasesDatabase.find(r => r.id === id);
  if (!item) return;

  const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/382">
  <MessageHeader>
    <MessageSender>FERWAP_MUSIC_DISTRO_GATEWAY</MessageSender>
    <SentOnBehalfOf>${item.artist}</SentOnBehalfOf>
    <MessageCreatedDateTime>${new Date().toISOString()}</MessageCreatedDateTime>
  </MessageHeader>
  <ReleaseList>
    <Release>
      <ReleaseId><ICPN>${item.upc}</ICPN></ReleaseId>
      <ReferenceTitle>${item.title}</ReferenceTitle>
    </Release>
  </ReleaseList>
  <ResourceList>
    <SoundRecording>
      <SoundRecordingId><ISRC>${item.isrc}</ISRC></SoundRecordingId>
      <ResourceReference>${item.audioFileName || 'master_audio.wav'}</ResourceReference>
    </SoundRecording>
  </ResourceList>
</ern:NewReleaseMessage>`;

  document.getElementById('xml-content').textContent = xmlPayload;
  document.getElementById('xml-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('xml-modal').classList.remove('active');
}

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', renderAdminTable);
