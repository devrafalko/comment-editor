const UserListItem = function (data) {
  let item = document.createElement('li')
  item.dataset['username'] = data.username

  let image = document.createElement('img')
  image.setAttribute('class', 'avatar')
  image.setAttribute('src', data.avatar_url)
  image.dataset['username'] = data.username
  item.appendChild(image)

  let text = `${data.name} (${data.username})`
  item.appendChild(document.createTextNode(text))

  return item
}

export default UserListItem
