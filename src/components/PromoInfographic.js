import ReactPlayer from "react-player";

export function PromoInfographic({title, url}) {
 
  return (
        
    // <div className={`h-full w-full bg-gray-750 relative overflow-hidden rounded-lg video-cover`} >
    <div className={`h-full w-full bg-gray-750 relative overflow-hidden rounded-lg`} >
                         
        <ReactPlayer
          
          //
          playsinline // very very imp prop
          playIcon={<></>}
          //
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}        
          //
          url={(url)?url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
          //
          // height={"100%"}
          // width={"100%"}
          // max-width= {'100%'}
          width={'auto'}
          height= {'auto'}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
        <h1 className={'text-white text-center leading-10'}>
        <div dangerouslySetInnerHTML={ { __html: (title)?title:"<h1>Welcome !</h1>"}} />
          {/* { (title)?title:"<h1>Welcome !</h1>" } */}
        </h1>
    </div>
  );
}
