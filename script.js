const api = "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";
const inp = document.getElementById('inp')
const images = document.querySelector('images')
const getImag = async () => {
  // make a request to openai api
  const methods = {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${api}`
    },
    body:JSON.stringify(
      {
        "prompt":inp.value,
        "n":3,
        "size":"256×256"
      }
      )
  }
  const res = await fetch("https://api.openai.com/v1/images/generations", methods)
  // parse the response as json
  const data = await res.json()
  console.log(data)
  const listImages = data.data;
  listImages.map(photo => {
    const container = document.createElement("div")
    images.append(container)
    const img = document.createElement("img")
    container.append(img)
    img.src = photo.url
  })
}