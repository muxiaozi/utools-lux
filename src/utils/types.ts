enum MediaType {
  Video,
  Audio,
}

type Stream = {
  id: string;
  quality: string;
  ext: string;
  size: number;
  need_mux: boolean; // 是否需要混流
};

type MediaInfo = {
  url: string;
  site: string;
  title: string;
  type: MediaType;
  streams: Stream[];
};
