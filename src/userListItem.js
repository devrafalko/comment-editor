import { createFancyTag } from './fancytags'

const UserListItem = function (data) {
  let item = document.createElement('li')
  item.dataset['username'] = data.username

  // User Avatar
  let image = document.createElement('img')
  image.setAttribute('class', 'avatar')
  image.setAttribute('src', data.avatar_url)
  image.dataset['username'] = data.username
  item.appendChild(image)

  // Name and Username
  item.appendChild(document.createTextNode(data.name))
  item.appendChild(createFancyTag({ username: data.username }))

  return item
}

export default UserListItem
