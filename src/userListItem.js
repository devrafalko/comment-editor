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

  // Name
  item.appendChild(document.createTextNode(data.name))

  // render username fancytag
  let fancytag = createFancyTag({
    name: 'username',
    value: data.username,
    text: data.username
  })
  item.appendChild(fancytag)

  return item
}

export default UserListItem
