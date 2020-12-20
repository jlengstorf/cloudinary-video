require('dotenv').config();

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'netlify',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const videoBaseTransformations = {
  fetch_format: 'auto',
  quality: 'auto',
  height: 360,
  width: 600,
  crop: 'fill', // avoid letterboxing if videos are different sizes
};

cloudinary.uploader
  .explicit('explorers/bumper', {
    // these two properties match the beginning of the URL:
    // https://res.cloudinary.com/netlify/image/upload/...
    //
    resource_type: 'video',
    type: 'upload',

    // "eager" means we want to run these transformations ahead of time to avoid
    // a slow first load time
    eager: [
      [
        videoBaseTransformations,

        // add the main content video and a transition
        {
          overlay: 'video:explorers:LCA-07-lifecycle-hooks',
          ...videoBaseTransformations,
        },
        {
          overlay: 'video:explorers:transition',
          effect: 'transition',
        },
        { flags: 'layer_apply' }, // <= apply the transformation
        { flags: 'layer_apply' }, // <= apply the actual video

        // add the outro bumper and a transition
        {
          overlay: 'video:explorers:countdown',
          ...videoBaseTransformations,
        },
        {
          overlay: 'video:explorers:transition',
          effect: 'transition',
        },
        { flags: 'layer_apply' },
        { flags: 'layer_apply' },

        // splice a title card at the beginning of the video
        {
          overlay: 'video:explorers:intro',
          flags: 'splice', // splice this into the video
          ...videoBaseTransformations,
        },
        {
          audio_codec: 'none', // remove the audio
          end_offset: 3, // shorten to 3 seconds
          effect: 'accelerate:-25', // slow down 25% (to ~4 seconds)
        },
        {
          overlay: {
            font_family: 'roboto', // many Google Fonts are supported
            font_size: 40,
            text_align: 'center',
            text: 'Lifecycle Hooks',
          },
          width: 500,
          crop: 'fit',
          color: 'white',
        },
        { flags: 'layer_apply' },
        {
          flags: 'layer_apply',
          start_offset: 0, // put this at the beginning of the video
        },
      ],
    ],

    // allow this transformed image to be cached to avoid re-running the same
    // transformations over and over again
    overwrite: false,
  })
  .then((result) => {
    console.log(result);
  });
