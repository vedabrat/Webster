var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
    +   '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    +   '  <td class="song-item-title">' + songName + '</td>'
    +   '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
    +   '</tr>'
    ;
    
    var $row = $(template);
    
    var clickHandler = function() {
        var songNumber = parseInt($(this).attr('data-song-number'));
        
        if (currentlyPlayingSongNumber !== null) {
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) {
            setSong(songNumber);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            
            $('.volume .fill').width(currentVolume + '%');
            $('.volume .thumb').css({left: currentVolume + '%'});
            
            $(this).html(pauseButtonTemplate);
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            if (currentSoundFile.isPaused()) {
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
            } else {
                currentSoundFile.pause();
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
            }
        }
    };
    
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
    };
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
        console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
    };
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var setCurrentAlbum = function(album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
``    
    $albumSongList.empty();
    
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        // #10 - 2
        currentSoundFile.bind('timeupdate', function(event) {
            // #11
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(currentSoundFile.getTime()); // #1 from assignment 21
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        // #3
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        // #4
        var seekBarFillRatio = offsetX / barWidth;
        
        // Add Conditional from Checkpoint 21
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }
        
        // #5
        updateSeekPercentage($(this), seekBarFillRatio);
        

    });
    // #7
    $seekBars.find('.thumb').mousedown(function(event) {
        // #8
        var $seekBar = $(this).parent();
        
        // #9
        $(document).bind('mousemove.thumb', function(event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            // Add Conditional from Checkpoint 21
            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
             } else {
                setVolume(seekBarFillRatio);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        
        // #10
       $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });

    });
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};


var nextSong = function() {
    
    var lastSongPlayed = currentSongFromAlbum;
    var lastSongNumber = currentlyPlayingSongNumber;
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum) + 1;
    
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0; 
    } 
    
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    
    updatePlayerBarSong();

    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var previousSong = function() {
    
    var lastSongPlayed = currentSongFromAlbum;
    var lastSongNumber = currentlyPlayingSongNumber;
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum) - 1; 
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    } 

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    
    updatePlayerBarSong();
    
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $previousSongNumberCell.html(pauseButtonTemplate); 
    $lastSongNumberCell.html(lastSongNumber); 
    
};

var updatePlayerBarSong = function(){

$('.currently-playing .song-name').text(currentSongFromAlbum.title);
$('.currently-playing .artist-name').text(currentAlbum.artist);
$('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
$('.main-controls .play-pause').html(playerBarPauseButton);
setTotalTimeInPlayerBar(currentSongFromAlbum.duration); // #2 from assignment
    
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

var $mainControlsSelector = $('.main-controls .play-pause'); // #1 from assignment
var togglePlayFromPlayerBar = function () { // #2 from assignment
	if (currentlyPlayingSongNumber) {
		if (currentSoundFile.isPaused()) {
			getSongNumberCell(currentlyPlayingSongNumber).html(pauseButtonTemplate);
			$mainControlsSelector.html(playerBarPauseButton);
			currentSoundFile.play();
		} else {
			getSongNumberCell(currentlyPlayingSongNumber).html(playButtonTemplate);
			$mainControlsSelector.html(playerBarPlayButton);
			currentSoundFile.pause();
		}
	} 
};

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $mainControlsSelector.click(togglePlayFromPlayerBar);
});

var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: [ 'mp3' ],
        preload: true
    });
    setVolume(currentVolume);
};

var seek = function(time) { 
    if (currentSoundFile) {
        currentSoundFile.setTime(time); 
    }
}

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};

// #1 from assignment 21
var setCurrentTimeInPlayerBar = function(currentTime) {
    $('.current-time').text(filterTimeCode(currentTime)); // #4 from assignment
};

// #2 from assignment 21
var setTotalTimeInPlayerBar = function(totalTime) {
    $('.total-time').text(filterTimeCode(totalTime)); // #5 from assignment
};

// #3 from asignment 21
var filterTimeCode = function(timeInSeconds) { // #3 from assignment 21
    var wholeSeconds = Math.floor(parseFloat(timeInSeconds));
    var wholeMinutes = Math.floor(wholeSeconds / 60);
    var displaySeconds = wholeSeconds % 60;
    var finalTime = wholeMinutes + ':';
    
    if (displaySeconds < 10) {
        finalTime += '0' + displaySeconds;
    } else {
        finalTime += displaySeconds;
    }
        
    return finalTime;
};