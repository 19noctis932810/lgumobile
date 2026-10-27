const appContent = document.getElementById('app-content')
const screens = [...document.querySelectorAll('[data-view]')]
const screenButtons = [...document.querySelectorAll('[data-screen]')]
const toast = document.getElementById('toast')
const themeToggle = document.getElementById('citizen-theme-toggle')
const themeStorageKey = 'tabina-citizen-theme'
let toastTimeout

const showToast = message =>{
  toast.textContent = message
  toast.classList.add('visible')
  window.clearTimeout(toastTimeout)
  toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 3200)
}

const showScreen = name =>{
  const selected = screens.find(screen => screen.dataset.view === name)
  if(!selected){
    showToast('This page is not available in the sample app.')
    return
  }

  screens.forEach(screen =>{
    screen.hidden = screen !== selected
    screen.classList.toggle('active', screen === selected)
  })
  screenButtons.forEach(button =>{
    const active = button.dataset.screen === name && button.closest('.bottom-nav')
    button.classList.toggle('active', Boolean(active))
    if(button.closest('.bottom-nav')){
      if(active){
        button.setAttribute('aria-current', 'page')
      }else{
        button.removeAttribute('aria-current')
      }
    }
  })
  appContent.scrollTo({ top: 0, behavior: 'smooth' })
}

const setTheme = theme =>{
  const dark = theme === 'dark'
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]').content = dark ? '#12233c' : '#2056bd'
  themeToggle.setAttribute('aria-pressed', String(dark))
  themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'day' : 'night'} theme`)
  themeToggle.title = `Switch to ${dark ? 'day' : 'night'} theme`
  themeToggle.innerHTML = `<i class="${dark ? 'ri-moon-line' : 'ri-sun-line'}" aria-hidden="true"></i>`
}

try{
  setTheme(localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light')
}catch(error){
  console.error('Unable to read the mobile app theme preference.', error)
  setTheme('light')
}

themeToggle.addEventListener('click', () =>{
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  if(typeof document.startViewTransition === 'function'){
    document.startViewTransition(() => setTheme(nextTheme))
  }else{
    setTheme(nextTheme)
  }

  try{
    localStorage.setItem(themeStorageKey, nextTheme)
  }catch(error){
    console.error('Unable to save the mobile app theme preference.', error)
    showToast('Theme changed, but this browser could not save the preference.')
  }
})

window.addEventListener('storage', event =>{
  if(event.key === themeStorageKey){
    setTheme(event.newValue === 'dark' ? 'dark' : 'light')
  }
})

document.querySelectorAll('#today-label').forEach(label =>{
  label.textContent = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())
})

screenButtons.forEach(button =>{
  button.addEventListener('click', () => showScreen(button.dataset.screen))
})

document.querySelectorAll('[data-toast]').forEach(button =>{
  if(button.closest('.settings-list') && button.textContent.includes('Edit Profile')){
    return
  }
  button.addEventListener('click', () => showToast(button.dataset.toast))
})

document.querySelectorAll('[data-hotline]').forEach(button =>{
  button.addEventListener('click', () => showToast('Sample contact only. No phone call will be placed.'))
})

const serviceSearch = document.getElementById('service-search')
serviceSearch.addEventListener('input', () =>{
  const query = serviceSearch.value.trim().toLocaleLowerCase()
  document.querySelectorAll('[data-view="services"] .service-card').forEach(card =>{
    card.hidden = !card.textContent.toLocaleLowerCase().includes(query)
  })
  document.querySelectorAll('[data-view="services"] .service-group').forEach(group =>{
    group.hidden = !group.querySelector('.service-card:not([hidden])')
  })
})

const globalSearch = document.getElementById('global-search')
globalSearch.addEventListener('keydown', event =>{
  if(event.key !== 'Enter'){
    return
  }
  event.preventDefault()
  const query = globalSearch.value.trim()
  showScreen('services')
  serviceSearch.value = query
  serviceSearch.dispatchEvent(new Event('input'))
})

document.querySelectorAll('[data-category]').forEach(button =>{
  button.addEventListener('click', () =>{
    const category = button.dataset.category
    document.querySelectorAll('[data-category]').forEach(item =>{
      item.classList.toggle('selected', item === button)
    })
    document.querySelectorAll('[data-category-item]').forEach(item =>{
      item.hidden = category !== 'All' && item.dataset.categoryItem !== category
    })
  })
})

const jobSearch = document.getElementById('job-search')
jobSearch.addEventListener('input', () =>{
  const query = jobSearch.value.trim().toLocaleLowerCase()
  document.querySelectorAll('.job-card').forEach(card =>{
    card.hidden = !card.textContent.toLocaleLowerCase().includes(query)
  })
})

document.querySelectorAll('[data-filter]').forEach(button =>{
  button.addEventListener('click', () =>{
    const filter = button.dataset.filter
    let visibleCount = 0
    document.querySelectorAll('[data-filter]').forEach(item =>{
      item.classList.toggle('selected', item === button)
    })
    document.querySelectorAll('#activity-list [data-kind]').forEach(item =>{
      const visible = filter === 'All' || item.dataset.kind === filter
      item.hidden = !visible
      visibleCount += Number(visible)
    })
    document.getElementById('activity-empty').hidden = visibleCount !== 0
  })
})

document.querySelectorAll('[data-emergency-type]').forEach(button =>{
  button.setAttribute('aria-pressed', 'false')
  button.addEventListener('click', () =>{
    document.querySelectorAll('[data-emergency-type]').forEach(item =>{
      const selected = item === button
      item.classList.toggle('selected', selected)
      item.setAttribute('aria-pressed', String(selected))
    })
  })
})

document.querySelectorAll('[data-situation]').forEach(button =>{
  button.setAttribute('aria-pressed', 'false')
  button.addEventListener('click', () =>{
    const selected = button.getAttribute('aria-pressed') !== 'true'
    button.setAttribute('aria-pressed', String(selected))
    button.classList.toggle('selected', selected)
  })
})

const addActivity = (title, kind, detail) =>{
  const item = document.createElement('article')
  item.className = 'activity-card'
  item.dataset.kind = kind
  const icon = document.createElement('i')
  icon.className = `activity-icon ${kind === 'Emergency' ? 'red' : 'orange'} ri-${kind === 'Emergency' ? 'alarm-warning' : 'file-list-3'}-line`
  const content = document.createElement('span')
  const heading = document.createElement('span')
  heading.className = 'activity-title'
  const titleElement = document.createElement('strong')
  titleElement.textContent = title
  const status = document.createElement('b')
  status.className = 'status review'
  status.textContent = 'Demo'
  heading.append(titleElement, status)
  const detailElement = document.createElement('small')
  detailElement.textContent = detail
  const ref = document.createElement('small')
  ref.textContent = `Sample entry · ${new Date().toLocaleString()}`
  content.append(heading, detailElement, ref)
  item.append(icon, content)
  document.getElementById('activity-list').prepend(item)
}

document.getElementById('emergency-form').addEventListener('submit', event =>{
  event.preventDefault()
  const selected = document.querySelector('[data-emergency-type].selected')
  if(!selected){
    showToast('Choose an emergency type to continue.')
    return
  }
  const mode = document.getElementById('practice-mode').checked ? 'Practice alert' : 'Demo emergency'
  addActivity(`${mode}: ${selected.dataset.emergencyType}`, 'Emergency', 'Not sent to emergency services')
  showToast('Sample alert recorded on this device only. No call or message was sent.')
})

const dialogs = {
  booking: document.getElementById('booking-dialog'),
  report: document.getElementById('report-dialog'),
  profile: document.getElementById('profile-dialog'),
}

const reportAttachmentInput = document.getElementById('report-attachments')
const reportAttachmentList = document.getElementById('attachment-list')
const reportAttachmentFeedback = document.getElementById('attachment-feedback')
const reportAttachments = []
const reportIssueType = document.getElementById('report-issue-type')
const reportSubtypeField = document.getElementById('report-subtype-field')
const reportSubtypeLabel = document.getElementById('report-subtype-label')
const reportSubtype = document.getElementById('report-subtype')
const reportSubtypeOptions = {
  Emergency: ['Fire', 'Medical emergency', 'Crime or security', 'Flood', 'Landslide', 'Other'],
  Minor: ['Road damage', 'Broken streetlight', 'Waste or sanitation', 'Water issue', 'Noise complaint', 'Other'],
}
const maxReportImages = 5
const maxReportVideos = 3
const maxReportVideoSize = 100 * 1024 * 1024

const updateReportSubtype = () =>{
  const options = reportSubtypeOptions[reportIssueType.value]
  reportSubtypeField.hidden = !options
  reportSubtype.disabled = !options
  reportSubtype.replaceChildren()
  reportSubtypeLabel.textContent = reportIssueType.value === 'Emergency'
    ? 'Type of Emergency'
    : reportIssueType.value === 'Minor' ? 'Minor' : ''

  if(options){
    const placeholder = document.createElement('option')
    placeholder.value = ''
    placeholder.textContent = reportIssueType.value === 'Emergency'
      ? 'Select type of emergency'
      : 'Select a minor issue'
    reportSubtype.append(placeholder)
    options.forEach(value =>{
      const option = document.createElement('option')
      option.value = value
      option.textContent = value
      reportSubtype.append(option)
    })
  }
}

reportIssueType.addEventListener('change', updateReportSubtype)
document.getElementById('report-form').addEventListener('reset', () => queueMicrotask(updateReportSubtype))
updateReportSubtype()

const formatFileSize = bytes =>{
  if(bytes < 1024 * 1024){
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const renderReportAttachments = () =>{
  reportAttachmentList.replaceChildren(...reportAttachments.map((attachment, index) =>{
    const item = document.createElement('div')
    item.className = 'attachment-item'

    const preview = document.createElement('span')
    preview.className = 'attachment-preview'
    if(attachment.kind === 'image'){
      const image = document.createElement('img')
      image.src = attachment.url
      image.alt = ''
      preview.append(image)
    }else{
      const icon = document.createElement('i')
      icon.className = 'ri-video-line'
      icon.setAttribute('aria-hidden', 'true')
      preview.append(icon)
    }

    const details = document.createElement('span')
    details.className = 'attachment-name'
    details.textContent = attachment.file.name
    const size = document.createElement('small')
    size.className = 'attachment-size'
    size.textContent = `${attachment.kind === 'image' ? 'Photo' : 'Video'} · ${formatFileSize(attachment.file.size)}`
    details.append(size)

    const remove = document.createElement('button')
    remove.type = 'button'
    remove.className = 'attachment-remove'
    remove.setAttribute('aria-label', `Remove ${attachment.file.name}`)
    remove.innerHTML = '<i class="ri-close-line" aria-hidden="true"></i>'
    remove.addEventListener('click', () =>{
      URL.revokeObjectURL(attachment.url)
      reportAttachments.splice(index, 1)
      renderReportAttachments()
      reportAttachmentFeedback.textContent = ''
    })

    item.append(preview, details, remove)
    return item
  }))
}

document.getElementById('add-report-attachments').addEventListener('click', () => reportAttachmentInput.click())
reportAttachmentInput.addEventListener('change', () =>{
  const rejected = []
  for(const file of reportAttachmentInput.files){
    const kind = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null
    if(!kind){
      rejected.push(`${file.name}: unsupported file type`)
      continue
    }

    const count = reportAttachments.filter(attachment => attachment.kind === kind).length
    const limit = kind === 'image' ? maxReportImages : maxReportVideos
    if(count >= limit){
      rejected.push(`${file.name}: maximum ${limit} ${kind === 'image' ? 'photos' : 'videos'} reached`)
      continue
    }
    if(kind === 'video' && file.size > maxReportVideoSize){
      rejected.push(`${file.name}: video exceeds 100 MB`)
      continue
    }

    reportAttachments.push({ file, kind, url: URL.createObjectURL(file) })
  }

  renderReportAttachments()
  reportAttachmentFeedback.textContent = rejected.length
    ? `Some files were not added: ${rejected.join('; ')}.`
    : ''
  reportAttachmentInput.value = ''
})

document.getElementById('report-form').addEventListener('reset', () =>{
  reportAttachments.forEach(attachment => URL.revokeObjectURL(attachment.url))
  reportAttachments.length = 0
  renderReportAttachments()
  reportAttachmentFeedback.textContent = ''
})

document.querySelectorAll('[data-open-report]').forEach(button =>{
  button.addEventListener('click', () => dialogs.report.showModal())
})

document.querySelectorAll('[data-book]').forEach(button =>{
  button.addEventListener('click', () =>{
    document.getElementById('booking-service').textContent = button.dataset.book
    dialogs.booking.showModal()
  })
})

document.querySelectorAll('[data-close]').forEach(button =>{
  button.addEventListener('click', () => button.closest('dialog').close())
})

Object.values(dialogs).forEach(dialog =>{
  dialog.addEventListener('click', event =>{
    if(event.target === dialog){
      dialog.close()
    }
  })
})

document.getElementById('booking-form').addEventListener('submit', event =>{
  event.preventDefault()
  const service = document.getElementById('booking-service').textContent
  const list = document.getElementById('appointment-list')
  const card = document.createElement('article')
  card.className = 'appointment-card'
  card.innerHTML = '<i class="service-icon blue ri-calendar-check-line"></i><span><strong></strong><small></small></span><b class="status">Pending</b>'
  card.querySelector('strong').textContent = service
  card.querySelector('small').textContent = 'Saved on this device · Demo request'
  list.prepend(card)
  document.getElementById('appointment-count').textContent = String(list.children.length)
  dialogs.booking.close()
  event.target.reset()
  showToast('Demo appointment saved on this device only.')
})

const reportForm = document.getElementById('report-form')
const reportWarningDialog = document.getElementById('report-warning-dialog')
const reportWarningConfirm = document.getElementById('report-warning-confirm')
const continueReportSubmit = document.getElementById('continue-report-submit')

reportForm.addEventListener('submit', event =>{
  event.preventDefault()
  reportWarningDialog.showModal()
})

reportWarningConfirm.addEventListener('change', () =>{
  continueReportSubmit.disabled = !reportWarningConfirm.checked
})

document.querySelectorAll('[data-warning-close]').forEach(button =>{
  button.addEventListener('click', () => reportWarningDialog.close())
})

reportWarningDialog.addEventListener('close', () =>{
  reportWarningConfirm.checked = false
  continueReportSubmit.disabled = true
})

continueReportSubmit.addEventListener('click', () =>{
  if(!reportWarningConfirm.checked){
    return
  }

  const issue = reportIssueType.value
  const subtype = reportSubtype.value
  const imageCount = reportAttachments.filter(attachment => attachment.kind === 'image').length
  const videoCount = reportAttachments.filter(attachment => attachment.kind === 'video').length
  const attachmentSummary = imageCount || videoCount
    ? ` · ${imageCount} photo${imageCount === 1 ? '' : 's'}, ${videoCount} video${videoCount === 1 ? '' : 's'} attached`
    : ''
  addActivity(`${issue}: ${subtype}`, 'Reports', `Issue report${attachmentSummary} · sample only`)
  reportWarningDialog.close()
  dialogs.report.close()
  reportForm.reset()
  showToast('Demo report saved on this device only. Attachments were not uploaded.')
})

document.getElementById('edit-profile').addEventListener('click', () => dialogs.profile.showModal())
document.querySelectorAll('.settings-list [data-toast]').forEach(button =>{
  if(button.textContent.includes('Edit Profile')){
    button.addEventListener('click', event =>{
      event.stopImmediatePropagation()
      dialogs.profile.showModal()
    })
  }
})

document.getElementById('profile-form').addEventListener('submit', event =>{
  event.preventDefault()
  const data = new FormData(event.target)
  document.getElementById('profile-name').textContent = data.get('name')
  document.getElementById('profile-phone').textContent = data.get('phone')
  document.getElementById('profile-address').textContent = data.get('location')
  document.querySelector('.avatar').textContent = String(data.get('name')).trim().charAt(0).toLocaleUpperCase()
  dialogs.profile.close()
  showToast('Profile updated for this page session.')
})

document.querySelectorAll('[data-permission]').forEach(button =>{
  button.addEventListener('click', () =>{
    const enabled = button.getAttribute('aria-pressed') !== 'true'
    button.setAttribute('aria-pressed', String(enabled))
    button.classList.toggle('enabled', enabled)
    button.innerHTML = `<i class="ri-${enabled ? 'check' : 'close'}-line"></i>`
    document.getElementById(`${button.dataset.permission.toLocaleLowerCase()}-state`).textContent = enabled ? 'Enabled' : 'Disabled'
  })
})

document.getElementById('support-form').addEventListener('submit', event =>{
  event.preventDefault()
  showToast('Demo support request saved for this page session.')
  event.target.reset()
})

document.querySelectorAll('.discovery-feature[data-category-item]').forEach(item =>{
  item.dataset.categoryItem = 'News'
})
